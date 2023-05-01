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
import { handlePositionOpened } from "../src/trade-pair";
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

export function createChainlinkAggregatorSetEvent(
  aggregator: Address
): ChainlinkAggregatorSet {
  let chainlinkAggregatorSetEvent = changetype<ChainlinkAggregatorSet>(
    newMockEvent()
  );

  chainlinkAggregatorSetEvent.parameters = new Array();

  chainlinkAggregatorSetEvent.parameters.push(
    new ethereum.EventParam(
      "aggregator",
      ethereum.Value.fromAddress(aggregator)
    )
  );

  return chainlinkAggregatorSetEvent;
}

export function createLiquidityPoolSetEvent(
  liquidityPool: Address
): LiquidityPoolSet {
  let liquidityPoolSetEvent = changetype<LiquidityPoolSet>(newMockEvent());

  liquidityPoolSetEvent.parameters = new Array();

  liquidityPoolSetEvent.parameters.push(
    new ethereum.EventParam(
      "liquidityPool",
      ethereum.Value.fromAddress(liquidityPool)
    )
  );

  return liquidityPoolSetEvent;
}

export function createPositionClosedEvent(
  trader: Address,
  positionId: BigInt,
  closePrice: BigInt,
  closeDate: BigInt,
  pnl: BigInt
): PositionClosed {
  let positionClosedEvent = changetype<PositionClosed>(newMockEvent());

  positionClosedEvent.parameters = new Array();

  positionClosedEvent.parameters.push(
    new ethereum.EventParam("trader", ethereum.Value.fromAddress(trader))
  );
  positionClosedEvent.parameters.push(
    new ethereum.EventParam(
      "positionId",
      ethereum.Value.fromUnsignedBigInt(positionId)
    )
  );
  positionClosedEvent.parameters.push(
    new ethereum.EventParam(
      "closePrice",
      ethereum.Value.fromUnsignedBigInt(closePrice)
    )
  );
  positionClosedEvent.parameters.push(
    new ethereum.EventParam(
      "closeDate",
      ethereum.Value.fromUnsignedBigInt(closeDate)
    )
  );
  positionClosedEvent.parameters.push(
    new ethereum.EventParam("pnl", ethereum.Value.fromSignedBigInt(pnl))
  );

  return positionClosedEvent;
}

export function createPositionOpenedEvent(
  trader: Address,
  positionId: BigInt,
  collateral: BigInt,
  shares: BigInt,
  leverage: BigInt,
  isLong: boolean,
  entryPrice: BigInt,
  liquidationPrice: BigInt,
  takeProfitPrice: BigInt,
  openDate: BigInt
): PositionOpened {
  let positionOpenedEvent = changetype<PositionOpened>(newMockEvent());

  positionOpenedEvent.parameters = new Array();

  positionOpenedEvent.parameters.push(
    new ethereum.EventParam("trader", ethereum.Value.fromAddress(trader))
  );
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "positionId",
      ethereum.Value.fromUnsignedBigInt(positionId)
    )
  );
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "collateral",
      ethereum.Value.fromUnsignedBigInt(collateral)
    )
  );
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares))
  );
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "leverage",
      ethereum.Value.fromUnsignedBigInt(leverage)
    )
  );
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam("isLong", ethereum.Value.fromBoolean(isLong))
  );
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "entryPrice",
      ethereum.Value.fromUnsignedBigInt(entryPrice)
    )
  );
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "liquidationPrice",
      ethereum.Value.fromUnsignedBigInt(liquidationPrice)
    )
  );
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "takeProfitPrice",
      ethereum.Value.fromUnsignedBigInt(takeProfitPrice)
    )
  );
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "openDate",
      ethereum.Value.fromUnsignedBigInt(openDate)
    )
  );

  return positionOpenedEvent;
}

export function createProtocolSetEvent(protocol: Address): ProtocolSet {
  let protocolSetEvent = changetype<ProtocolSet>(newMockEvent());

  protocolSetEvent.parameters = new Array();

  protocolSetEvent.parameters.push(
    new ethereum.EventParam("protocol", ethereum.Value.fromAddress(protocol))
  );

  return protocolSetEvent;
}

export function createProtocolShareTakenEvent(
  protocol: Address,
  protocolShare: BigInt
): ProtocolShareTaken {
  let protocolShareTakenEvent = changetype<ProtocolShareTaken>(newMockEvent());

  protocolShareTakenEvent.parameters = new Array();

  protocolShareTakenEvent.parameters.push(
    new ethereum.EventParam("protocol", ethereum.Value.fromAddress(protocol))
  );
  protocolShareTakenEvent.parameters.push(
    new ethereum.EventParam(
      "protocolShare",
      ethereum.Value.fromUnsignedBigInt(protocolShare)
    )
  );

  return protocolShareTakenEvent;
}
