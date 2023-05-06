import {
  assert,
  describe,
  test,
  clearStore,
  afterEach,
} from "matchstick-as/assembly/index";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  PositionClosed,
  PositionOpened,
  ProtocolShareTaken,
} from "../generated/TradePair/TradePair";
import {
  handleLiquidityPoolSet,
  handlePositionClosed,
  handlePositionOpened,
  handleProtocolShareTaken,
} from "../src/trade-pair";
import { defaultAddress, newEvent } from "./utils/event.utils";
import {
  closeDate,
  closeDefaultPosition,
  closePrice,
  collateral,
  createLiquidityPoolSetEvent,
  entryPrice,
  isLong,
  leverage,
  liquidationPrice,
  openDate,
  openDefaultPosition,
  pnlShares,
  shares,
  takeProfitPrice,
} from "./trade-pair-utils";
import {
  ZERO_ADDRESS,
  handleDeposit,
  handleTransfer,
} from "../src/liquidity-pool";
import {
  createDepositEvent,
  createTransferEvent,
  liquidityPoolAddress,
} from "./liquidity-pool-utils";

describe("TradePair Tests", () => {
  afterEach(() => {
    clearStore();
  });

  test("Opens Position", () => {
    let positionId = openDefaultPosition().toString();

    assert.entityCount("Position", 1);

    assert.fieldEquals(
      "Position",
      positionId,
      "trader",
      defaultAddress.toHex()
    );
    assert.fieldEquals(
      "Position",
      positionId,
      "collateral",
      collateral.toString()
    );
    assert.fieldEquals("Position", positionId, "shares", shares.toString());
    assert.fieldEquals("Position", positionId, "leverage", leverage.toString());
    assert.fieldEquals("Position", positionId, "isLong", isLong.toString());
    assert.fieldEquals(
      "Position",
      positionId,
      "entryPrice",
      entryPrice.toString()
    );
    assert.fieldEquals(
      "Position",
      positionId,
      "liquidationPrice",
      liquidationPrice.toString()
    );
    assert.fieldEquals(
      "Position",
      positionId,
      "takeProfitPrice",
      takeProfitPrice.toString()
    );
    assert.fieldEquals("Position", positionId, "openDate", openDate.toString());
    assert.fieldEquals("Position", positionId, "isOpen", "true");
  });

  test("Closes Position", () => {
    let positionId = openDefaultPosition();

    handlePositionClosed(
      newEvent<PositionClosed>([
        ethereum.Value.fromAddress(defaultAddress), // trader
        ethereum.Value.fromUnsignedBigInt(positionId), // positionId
        ethereum.Value.fromUnsignedBigInt(closePrice), // closePrice
        ethereum.Value.fromUnsignedBigInt(closeDate), // closeDate
        ethereum.Value.fromUnsignedBigInt(pnlShares), // pnlShares
      ])
    );

    assert.entityCount("Position", 1);

    assert.fieldEquals(
      "Position",
      positionId.toString(),
      "trader",
      defaultAddress.toHex()
    );
    assert.fieldEquals(
      "Position",
      positionId.toString(),
      "closePrice",
      closePrice.toString()
    );
    assert.fieldEquals(
      "Position",
      positionId.toString(),
      "closeDate",
      closeDate.toString()
    );
    assert.fieldEquals(
      "Position",
      positionId.toString(),
      "pnlShares",
      pnlShares.toString()
    );
    assert.fieldEquals(
      "Position",
      positionId.toString(),
      "isLong",
      isLong.toString()
    );
    assert.fieldEquals("Position", positionId.toString(), "isOpen", "false");
  });

  test("Increases Stats on open", () => {
    openDefaultPosition(); // long
    openDefaultPosition(); // long
    openDefaultPosition(false); // short

    assert.entityCount("Position", 3);
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "longCollateral",
      collateral.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "shortCollateral",
      collateral.toString()
    );
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "longShares",
      shares.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "shortShares",
      shares.toString()
    );
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "longPositionCount",
      "2"
    );
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "shortPositionCount",
      "1"
    );
  });

  test("Decreases Stats on open", () => {
    openDefaultPosition(); // long
    let p1 = openDefaultPosition(); // long
    let p2 = openDefaultPosition(false); // short

    closeDefaultPosition(p1);
    closeDefaultPosition(p2);

    assert.entityCount("Position", 3);
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "longCollateral",
      collateral.toString()
    );
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "shortCollateral",
      "0"
    );
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "longShares",
      shares.toString()
    );
    assert.fieldEquals("TradePair", defaultAddress.toHex(), "shortShares", "0");
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "longPositionCount",
      "1"
    );
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "shortPositionCount",
      "0"
    );
  });

  test("Logs Protocol Shares", () => {
    handleProtocolShareTaken(
      newEvent<ProtocolShareTaken>([
        ethereum.Value.fromAddress(defaultAddress), // protocol
        ethereum.Value.fromUnsignedBigInt(shares), // shares
      ])
    );

    assert.entityCount("Protocol", 1);
    assert.fieldEquals(
      "Protocol",
      defaultAddress.toHex(),
      "totalShares",
      shares.toString()
    );
  });

  test("Min and Max closing price", () => {
    let positionIdLong = openDefaultPosition().toString();
    let positionIdShort = openDefaultPosition(false).toString();

    assert.fieldEquals(
      "Position",
      positionIdLong,
      "minClosePrice",
      liquidationPrice.toString()
    );
    assert.fieldEquals(
      "Position",
      positionIdLong,
      "maxClosePrice",
      takeProfitPrice.toString()
    );

    assert.fieldEquals(
      "Position",
      positionIdShort,
      "minClosePrice",
      takeProfitPrice.toString()
    );
    assert.fieldEquals(
      "Position",
      positionIdShort,
      "maxClosePrice",
      liquidationPrice.toString()
    );
  });

  test("pnl shares and assets", () => {
    handleLiquidityPoolSet(createLiquidityPoolSetEvent(liquidityPoolAddress));

    let p1 = openDefaultPosition();
    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));
    closeDefaultPosition(p1);

    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlShares",
      shares.toString() // shares at entry
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlAssets",
      collateral.div(BigInt.fromI32(2)).toString() // half of collateral, as no other liquidity is added
    );
    assert.fieldEquals("Position", p1.toString(), "pnlAssetsPercentage", "50");
  });

  test("pnl shares and assets after second deposit", () => {
    handleLiquidityPoolSet(createLiquidityPoolSetEvent(liquidityPoolAddress));

    let p1 = openDefaultPosition();
    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));

    // Another position
    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));
    closeDefaultPosition(p1);

    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlShares",
      shares.toString() // shares at entry
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlAssets",
      collateral.div(BigInt.fromI32(2)).toString() // half of collateral, as ratio is the same
    );
    assert.fieldEquals("Position", p1.toString(), "pnlAssetsPercentage", "50");
  });

  test("pnl shares and assets after burn", () => {
    handleLiquidityPoolSet(createLiquidityPoolSetEvent(liquidityPoolAddress));

    let p1 = openDefaultPosition();
    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));

    // Burn half of the shares
    handleTransfer(createTransferEvent(defaultAddress, ZERO_ADDRESS, shares));
    closeDefaultPosition(p1);

    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlShares",
      shares.toString() // shares at entry
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlAssets",
      collateral.toString() // all of collateral
    );
    assert.fieldEquals("Position", p1.toString(), "pnlAssetsPercentage", "100");
  });
});
