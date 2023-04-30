import {
  ChainlinkAggregatorSet as ChainlinkAggregatorSetEvent,
  LiquidityPoolSet as LiquidityPoolSetEvent,
  PositionClosed as PositionClosedEvent,
  PositionOpened as PositionOpenedEvent,
  ProtocolSet as ProtocolSetEvent,
  ProtocolShareTaken as ProtocolShareTakenEvent
} from "../generated/TradePair/TradePair"
import {
  ChainlinkAggregatorSet,
  LiquidityPoolSet,
  PositionClosed,
  PositionOpened,
  ProtocolSet,
  ProtocolShareTaken
} from "../generated/schema"

export function handleChainlinkAggregatorSet(
  event: ChainlinkAggregatorSetEvent
): void {
  let entity = new ChainlinkAggregatorSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.aggregator = event.params.aggregator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLiquidityPoolSet(event: LiquidityPoolSetEvent): void {
  let entity = new LiquidityPoolSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.liquidityPool = event.params.liquidityPool

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePositionClosed(event: PositionClosedEvent): void {
  let entity = new PositionClosed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.trader = event.params.trader
  entity.positionId = event.params.positionId
  entity.closePrice = event.params.closePrice
  entity.closeDate = event.params.closeDate
  entity.pnl = event.params.pnl

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePositionOpened(event: PositionOpenedEvent): void {
  let entity = new PositionOpened(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.trader = event.params.trader
  entity.positionId = event.params.positionId
  entity.collateral = event.params.collateral
  entity.shares = event.params.shares
  entity.leverage = event.params.leverage
  entity.isLong = event.params.isLong
  entity.entryPrice = event.params.entryPrice
  entity.liquidationPrice = event.params.liquidationPrice
  entity.takeProfitPrice = event.params.takeProfitPrice
  entity.openDate = event.params.openDate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProtocolSet(event: ProtocolSetEvent): void {
  let entity = new ProtocolSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.protocol = event.params.protocol

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProtocolShareTaken(event: ProtocolShareTakenEvent): void {
  let entity = new ProtocolShareTaken(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.protocol = event.params.protocol
  entity.protocolShare = event.params.protocolShare

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
