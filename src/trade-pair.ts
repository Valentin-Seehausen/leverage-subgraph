import { log } from "@graphprotocol/graph-ts";

import {
  ChainlinkAggregatorSet as ChainlinkAggregatorSetEvent,
  LiquidityPoolSet as LiquidityPoolSetEvent,
  PositionClosed as PositionClosedEvent,
  PositionOpened as PositionOpenedEvent,
  ProtocolSet as ProtocolSetEvent,
  ProtocolShareTaken as ProtocolShareTakenEvent,
} from "../generated/TradePair/TradePair";
import {
  ChainlinkAggregatorSet,
  LiquidityPoolSet,
  Position,
  PositionClosed,
  PositionOpened,
  ProtocolSet,
  ProtocolShareTaken,
  Trader,
} from "../generated/schema";

export function getTrader(id: string): Trader {
  let trader = Trader.load(id);

  if (trader == null) {
    trader = new Trader(id);
    trader.save();
  }

  return trader as Trader;
}

export function getPosition(id: string): Position {
  let position = Position.load(id);

  if (position == null) {
    position = new Position(id);
  }

  return position as Position;
}

export function handleChainlinkAggregatorSet(
  event: ChainlinkAggregatorSetEvent
): void {
  let entity = new ChainlinkAggregatorSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.aggregator = event.params.aggregator;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleLiquidityPoolSet(event: LiquidityPoolSetEvent): void {
  let entity = new LiquidityPoolSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.liquidityPool = event.params.liquidityPool;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handlePositionClosed(event: PositionClosedEvent): void {
  let position = getPosition(event.params.positionId.toString());

  position.closePrice = event.params.closePrice;
  position.closeDate = event.params.closeDate;
  position.pnl = event.params.pnl;
  position.closeTransactionHash = event.transaction.hash;
  position.isOpen = false;

  position.save();
}

export function handlePositionOpened(event: PositionOpenedEvent): void {
  log.info("handlePositionOpened", []);

  let position = getPosition(event.params.positionId.toString());

  position.trader = getTrader(event.params.trader.toHex()).id;
  position.collateral = event.params.collateral;
  position.shares = event.params.shares;
  position.leverage = event.params.leverage;
  position.isLong = event.params.isLong;
  position.entryPrice = event.params.entryPrice;
  position.liquidationPrice = event.params.liquidationPrice;
  position.takeProfitPrice = event.params.takeProfitPrice;
  position.openDate = event.params.openDate;
  position.openTransactionHash = event.transaction.hash;
  position.isOpen = true;

  position.save();
}

export function handleProtocolSet(event: ProtocolSetEvent): void {
  let entity = new ProtocolSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.protocol = event.params.protocol;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleProtocolShareTaken(event: ProtocolShareTakenEvent): void {
  let entity = new ProtocolShareTaken(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.protocol = event.params.protocol;
  entity.protocolShare = event.params.protocolShare;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
