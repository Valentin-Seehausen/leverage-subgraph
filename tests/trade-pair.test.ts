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

describe("TradePair Tests", () => {
  afterEach(() => {
    clearStore();
  });

  test("Opens Position", () => {
    let positionId = BigInt.fromI32(1);
    let collateral = BigInt.fromI32(1_000_000);
    let shares = BigInt.fromI32(1_000_000_000);
    let leverage = BigInt.fromI32(5_000_000);
    let isLong = false;
    let entryPrice = BigInt.fromI32(20_000);
    let liquidationPrice = BigInt.fromI32(22_000);
    let takeProfitPrice = BigInt.fromI32(18_000);
    let openDate = BigInt.fromI32(1234);

    handlePositionOpened(
      newEvent<PositionOpened>([
        ethereum.Value.fromAddress(defaultAddress), // trader
        ethereum.Value.fromUnsignedBigInt(positionId), // positionId
        ethereum.Value.fromUnsignedBigInt(collateral), // collateral
        ethereum.Value.fromUnsignedBigInt(shares), // shares
        ethereum.Value.fromUnsignedBigInt(leverage), // leverage
        ethereum.Value.fromBoolean(isLong), // isLong
        ethereum.Value.fromUnsignedBigInt(entryPrice), // entryPrice
        ethereum.Value.fromUnsignedBigInt(liquidationPrice), // liquidationPrice
        ethereum.Value.fromUnsignedBigInt(takeProfitPrice), // takeProfitPrice
        ethereum.Value.fromUnsignedBigInt(openDate), // openDate
      ])
    );

    assert.entityCount("Position", 1);

    assert.fieldEquals("Position", "1", "trader", defaultAddress.toHex());
    assert.fieldEquals("Position", "1", "collateral", collateral.toString());
    assert.fieldEquals("Position", "1", "shares", shares.toString());
    assert.fieldEquals("Position", "1", "leverage", leverage.toString());
    assert.fieldEquals("Position", "1", "isLong", isLong.toString());
    assert.fieldEquals("Position", "1", "entryPrice", entryPrice.toString());
    assert.fieldEquals(
      "Position",
      "1",
      "liquidationPrice",
      liquidationPrice.toString()
    );
    assert.fieldEquals(
      "Position",
      "1",
      "takeProfitPrice",
      takeProfitPrice.toString()
    );
    assert.fieldEquals("Position", "1", "openDate", openDate.toString());
    assert.fieldEquals("Position", "1", "isLong", isLong.toString());
    assert.fieldEquals("Position", "1", "isOpen", "true");
  });

  test("Closes Position", () => {
    let positionId = BigInt.fromI32(1);
    let collateral = BigInt.fromI32(1_000_000);
    let shares = BigInt.fromI32(1_000_000_000);
    let leverage = BigInt.fromI32(5_000_000);
    let isLong = false;
    let entryPrice = BigInt.fromI32(20_000);
    let liquidationPrice = BigInt.fromI32(22_000);
    let takeProfitPrice = BigInt.fromI32(18_000);
    let openDate = BigInt.fromI32(1234);

    let closePrice = BigInt.fromI32(22_000);
    let closeDate = BigInt.fromI32(12345);
    let pnl = BigInt.fromI32(1_000_000_000);

    handlePositionOpened(
      newEvent<PositionOpened>([
        ethereum.Value.fromAddress(defaultAddress), // trader
        ethereum.Value.fromUnsignedBigInt(positionId), // positionId
        ethereum.Value.fromUnsignedBigInt(collateral), // collateral
        ethereum.Value.fromUnsignedBigInt(shares), // shares
        ethereum.Value.fromUnsignedBigInt(leverage), // leverage
        ethereum.Value.fromBoolean(isLong), // isLong
        ethereum.Value.fromUnsignedBigInt(entryPrice), // entryPrice
        ethereum.Value.fromUnsignedBigInt(liquidationPrice), // liquidationPrice
        ethereum.Value.fromUnsignedBigInt(takeProfitPrice), // takeProfitPrice
        ethereum.Value.fromUnsignedBigInt(openDate), // openDate
      ])
    );

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

    assert.fieldEquals("Position", "1", "trader", defaultAddress.toHex());
    assert.fieldEquals("Position", "1", "closePrice", closePrice.toString());
    assert.fieldEquals("Position", "1", "closeDate", closeDate.toString());
    assert.fieldEquals("Position", "1", "pnl", pnl.toString());
    assert.fieldEquals("Position", "1", "isLong", isLong.toString());
    assert.fieldEquals("Position", "1", "isOpen", "false");
  });
});
