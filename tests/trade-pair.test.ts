import {
  assert,
  describe,
  test,
  clearStore,
  afterEach,
  logStore,
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
  createPositionClosedEvent,
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
      createPositionClosedEvent(
        defaultAddress,
        positionId,
        isLong,
        shares,
        entryPrice,
        leverage,
        pnlShares,
        closePrice,
        closeDate
      )
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
      shares.times(BigInt.fromI32(1)).toString()
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

  test("pnl shares and assets (profitable position)", () => {
    handleLiquidityPoolSet(createLiquidityPoolSetEvent(liquidityPoolAddress));

    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    let p1 = openDefaultPosition();

    // Close position and mint shares
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
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
      "payoutAssets",
      collateral.toString() // Should receive collateral back (no other deposit)
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlAssets",
      "0" // no pnl assets, as no other liquidity is added
    );
    assert.fieldEquals("Position", p1.toString(), "pnlAssetsPercentage", "0");
    assert.fieldEquals("Position", p1.toString(), "pnlSharesPercentage", "100");
  });

  test("pnl shares and assets after second deposit", () => {
    handleLiquidityPoolSet(createLiquidityPoolSetEvent(liquidityPoolAddress));

    // Someone openes position (1 shares : 1 collateral)
    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    let p1 = openDefaultPosition();

    // Trader Opens position (2 shares : 2 collateral)
    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    let p2 = openDefaultPosition();

    // Someone closes position with loss (burns shares) (1 shares : 2 collateral)
    handleTransfer(createTransferEvent(defaultAddress, ZERO_ADDRESS, shares));
    closeDefaultPosition(p1, false);

    // Trader closes position with win (has 2 shares) (2 shares : 2 collateral)
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
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
      "payoutShares",
      shares.times(BigInt.fromI32(2)).toString() // shares at entry
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "payoutAssets",
      collateral.times(BigInt.fromI32(2)).toString() // got 2 collateral back
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlAssets",
      collateral.toString() //made collateral profit
    );
    assert.fieldEquals("Position", p1.toString(), "pnlAssetsPercentage", "100");
    assert.fieldEquals("Position", p1.toString(), "pnlSharesPercentage", "100");
  });

  test("pnl shares and assets with other deposits", () => {
    handleLiquidityPoolSet(createLiquidityPoolSetEvent(liquidityPoolAddress));

    // Simulate a 1:1 ratio before (from other position)
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));

    // Open a position (2:2 ratio)
    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    let p1 = openDefaultPosition();

    // And mint the same amount of shares again (for close) (3:2 share:asset)
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));

    closeDefaultPosition(p1);

    // Now position should 3:2 of asset payout

    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlShares",
      shares.toString() // shares at entry
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "payoutShares",
      shares.times(BigInt.fromI32(2)).toString() // also set
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "payoutAssets",
      collateral
        .times(BigInt.fromI32(4))
        .div(BigInt.fromI32(3))
        .toString() // Is 2 share * 2 collateral / 3 share = 4/3  collateral
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlAssets",
      collateral.div(BigInt.fromI32(3)).toString() // 1/3 of collateral input
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlAssetsPercentage",
      "33.3333"
    );
    assert.fieldEquals("Position", p1.toString(), "pnlSharesPercentage", "100");
  });

  test("Loss Position", () => {
    handleLiquidityPoolSet(createLiquidityPoolSetEvent(liquidityPoolAddress));

    handleDeposit(createDepositEvent(liquidityPoolAddress, collateral, shares));
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    let p1 = openDefaultPosition();

    // Position Loss: Burn all shares
    handleTransfer(createTransferEvent(defaultAddress, ZERO_ADDRESS, shares));
    closeDefaultPosition(p1, false);

    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlShares",
      shares.neg().toString() // shares at entry
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlAssets",
      collateral.neg().toString() // all of collateral
    );
    assert.fieldEquals("Position", p1.toString(), "payoutAssets", "0");
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlAssetsPercentage",
      "-100"
    );
    assert.fieldEquals(
      "Position",
      p1.toString(),
      "pnlSharesPercentage",
      "-100"
    );
  });
});
