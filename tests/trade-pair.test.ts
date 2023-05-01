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
} from "../generated/TradePair/TradePair";
import { handlePositionClosed, handlePositionOpened } from "../src/trade-pair";
import { defaultAddress, newEvent } from "./utils/event.utils";
import {
  closeDate,
  closePrice,
  collateral,
  entryPrice,
  isLong,
  leverage,
  liquidationPrice,
  openDate,
  openDefaultPosition,
  pnl,
  shares,
  takeProfitPrice,
} from "./trade-pair-utils";

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
        ethereum.Value.fromUnsignedBigInt(pnl), // pnl
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
      "pnl",
      pnl.toString()
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
      BigInt.fromI32(2).toString()
    );
    assert.fieldEquals(
      "TradePair",
      defaultAddress.toHex(),
      "shortPositionCount",
      BigInt.fromI32(1).toString()
    );
  });
});
