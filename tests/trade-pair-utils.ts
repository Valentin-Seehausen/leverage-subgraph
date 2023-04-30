import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  ChainlinkAggregatorSet,
  LiquidityPoolSet,
  PositionClosed,
  PositionOpened,
  ProtocolSet,
  ProtocolShareTaken
} from "../generated/TradePair/TradePair"

export function createChainlinkAggregatorSetEvent(
  aggregator: Address
): ChainlinkAggregatorSet {
  let chainlinkAggregatorSetEvent = changetype<ChainlinkAggregatorSet>(
    newMockEvent()
  )

  chainlinkAggregatorSetEvent.parameters = new Array()

  chainlinkAggregatorSetEvent.parameters.push(
    new ethereum.EventParam(
      "aggregator",
      ethereum.Value.fromAddress(aggregator)
    )
  )

  return chainlinkAggregatorSetEvent
}

export function createLiquidityPoolSetEvent(
  liquidityPool: Address
): LiquidityPoolSet {
  let liquidityPoolSetEvent = changetype<LiquidityPoolSet>(newMockEvent())

  liquidityPoolSetEvent.parameters = new Array()

  liquidityPoolSetEvent.parameters.push(
    new ethereum.EventParam(
      "liquidityPool",
      ethereum.Value.fromAddress(liquidityPool)
    )
  )

  return liquidityPoolSetEvent
}

export function createPositionClosedEvent(
  trader: Address,
  positionId: BigInt,
  closePrice: BigInt,
  closeDate: BigInt,
  pnl: BigInt
): PositionClosed {
  let positionClosedEvent = changetype<PositionClosed>(newMockEvent())

  positionClosedEvent.parameters = new Array()

  positionClosedEvent.parameters.push(
    new ethereum.EventParam("trader", ethereum.Value.fromAddress(trader))
  )
  positionClosedEvent.parameters.push(
    new ethereum.EventParam(
      "positionId",
      ethereum.Value.fromUnsignedBigInt(positionId)
    )
  )
  positionClosedEvent.parameters.push(
    new ethereum.EventParam(
      "closePrice",
      ethereum.Value.fromUnsignedBigInt(closePrice)
    )
  )
  positionClosedEvent.parameters.push(
    new ethereum.EventParam(
      "closeDate",
      ethereum.Value.fromUnsignedBigInt(closeDate)
    )
  )
  positionClosedEvent.parameters.push(
    new ethereum.EventParam("pnl", ethereum.Value.fromSignedBigInt(pnl))
  )

  return positionClosedEvent
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
  let positionOpenedEvent = changetype<PositionOpened>(newMockEvent())

  positionOpenedEvent.parameters = new Array()

  positionOpenedEvent.parameters.push(
    new ethereum.EventParam("trader", ethereum.Value.fromAddress(trader))
  )
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "positionId",
      ethereum.Value.fromUnsignedBigInt(positionId)
    )
  )
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "collateral",
      ethereum.Value.fromUnsignedBigInt(collateral)
    )
  )
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares))
  )
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "leverage",
      ethereum.Value.fromUnsignedBigInt(leverage)
    )
  )
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam("isLong", ethereum.Value.fromBoolean(isLong))
  )
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "entryPrice",
      ethereum.Value.fromUnsignedBigInt(entryPrice)
    )
  )
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "liquidationPrice",
      ethereum.Value.fromUnsignedBigInt(liquidationPrice)
    )
  )
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "takeProfitPrice",
      ethereum.Value.fromUnsignedBigInt(takeProfitPrice)
    )
  )
  positionOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "openDate",
      ethereum.Value.fromUnsignedBigInt(openDate)
    )
  )

  return positionOpenedEvent
}

export function createProtocolSetEvent(protocol: Address): ProtocolSet {
  let protocolSetEvent = changetype<ProtocolSet>(newMockEvent())

  protocolSetEvent.parameters = new Array()

  protocolSetEvent.parameters.push(
    new ethereum.EventParam("protocol", ethereum.Value.fromAddress(protocol))
  )

  return protocolSetEvent
}

export function createProtocolShareTakenEvent(
  protocol: Address,
  protocolShare: BigInt
): ProtocolShareTaken {
  let protocolShareTakenEvent = changetype<ProtocolShareTaken>(newMockEvent())

  protocolShareTakenEvent.parameters = new Array()

  protocolShareTakenEvent.parameters.push(
    new ethereum.EventParam("protocol", ethereum.Value.fromAddress(protocol))
  )
  protocolShareTakenEvent.parameters.push(
    new ethereum.EventParam(
      "protocolShare",
      ethereum.Value.fromUnsignedBigInt(protocolShare)
    )
  )

  return protocolShareTakenEvent
}
