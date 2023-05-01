import { log, BigInt } from "@graphprotocol/graph-ts";

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
  TradePair,
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

export function getTradePair(id: string): TradePair {
  let tradePair = TradePair.load(id);

  if (tradePair == null) {
    tradePair = new TradePair(id);
    tradePair.longCollateral = BigInt.fromI32(0);
    tradePair.shortCollateral = BigInt.fromI32(0);
    tradePair.longShares = BigInt.fromI32(0);
    tradePair.shortShares = BigInt.fromI32(0);
    tradePair.longPositionCount = BigInt.fromI32(0);
    tradePair.shortPositionCount = BigInt.fromI32(0);
  }

  return tradePair as TradePair;
}

export function addStatsToTradePair(
  tradePairId: string,
  collateral: BigInt,
  shares: BigInt,
  isLong: boolean
): void {
  let tradePair = getTradePair(tradePairId);

  // Is position opened or closed?
  let countDirection = collateral.gt(BigInt.fromI32(0))
    ? BigInt.fromI32(1)
    : BigInt.fromI32(-1);

  if (isLong) {
    tradePair.longCollateral = tradePair.longCollateral.plus(collateral);
    tradePair.longShares = tradePair.longShares.plus(shares);
    tradePair.longPositionCount = tradePair.longPositionCount.plus(
      countDirection
    );
  } else {
    tradePair.shortCollateral = tradePair.shortCollateral.plus(collateral);
    tradePair.shortShares = tradePair.shortShares.plus(shares);
    tradePair.shortPositionCount = tradePair.shortPositionCount.plus(
      countDirection
    );
  }

  tradePair.save();
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

  addStatsToTradePair(
    event.address.toHex(),
    position.collateral.neg(),
    position.shares.neg(),
    position.isLong
  );
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

  addStatsToTradePair(
    event.address.toHex(),
    event.params.collateral,
    event.params.shares,
    event.params.isLong
  );
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
