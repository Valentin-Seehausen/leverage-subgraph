import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ChainlinkAggregatorSet,
  LiquidityPoolSet,
  PositionClosed,
  PositionOpened,
  ProtocolSet,
  ProtocolShareTaken,
} from "../generated/TradePair/TradePair";
import { handlePositionClosed, handlePositionOpened } from "../src/trade-pair";
import { defaultAddress, newEvent } from "./utils/event.utils";

export let positionId = BigInt.fromI32(1);
export let collateral = BigInt.fromI32(1_000_000);
export let shares = BigInt.fromI32(1_000_000_000);
export let leverage = BigInt.fromI32(5_000_000);
export let entryPrice = BigInt.fromI32(20_000);
export let liquidationPrice = BigInt.fromI32(22_000);
export let takeProfitPrice = BigInt.fromI32(18_000);
export let openDate = BigInt.fromI32(1234);
export let isLong = true;

export let closePrice = BigInt.fromI32(22_000);
export let closeDate = BigInt.fromI32(12345);
export let pnl = BigInt.fromI32(1_000_000_000);

export let positionCounter = BigInt.fromI32(0);

/// Creates a new PositionOpened event with the default values
/// and calls the handlePositionOpened handler.
/// Position Id is returned and incremented by 1 after each call.
export function openDefaultPosition(isLong_: boolean = isLong): BigInt {
  positionCounter = positionCounter.plus(BigInt.fromI32(1));

  handlePositionOpened(
    newEvent<PositionOpened>([
      ethereum.Value.fromAddress(defaultAddress), // trader
      ethereum.Value.fromUnsignedBigInt(positionCounter), // positionId
      ethereum.Value.fromUnsignedBigInt(collateral), // collateral
      ethereum.Value.fromUnsignedBigInt(shares), // shares
      ethereum.Value.fromUnsignedBigInt(leverage), // leverage
      ethereum.Value.fromBoolean(isLong_), // isLong
      ethereum.Value.fromUnsignedBigInt(entryPrice), // entryPrice
      ethereum.Value.fromUnsignedBigInt(liquidationPrice), // liquidationPrice
      ethereum.Value.fromUnsignedBigInt(takeProfitPrice), // takeProfitPrice
      ethereum.Value.fromUnsignedBigInt(openDate), // openDate
    ])
  );

  return positionCounter;
}

export function closeDefaultPosition(positionId_: BigInt = positionId): void {
  handlePositionClosed(
    newEvent<PositionClosed>([
      ethereum.Value.fromAddress(defaultAddress), // trader
      ethereum.Value.fromUnsignedBigInt(positionId_), // positionId
      ethereum.Value.fromUnsignedBigInt(closePrice), // closePrice
      ethereum.Value.fromUnsignedBigInt(closeDate), // closeDate
      ethereum.Value.fromUnsignedBigInt(pnl), // pnl
    ])
  );
}
