import { BigInt, Address, log } from "@graphprotocol/graph-ts";

import {
  Deposit as DepositEvent,
  Redeem as RedeemEvent,
  Transfer as TransferEvent,
  ProtocolSet as ProtocolSetEvent,
} from "../generated/LiquidityPool/LiquidityPool";
import { LiquidityPool } from "../generated/schema";
import { getProtocol } from "./trade-pair";

export const ZERO_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

export function getLiquidityPool(id: string): LiquidityPool {
  let liquidityPool = LiquidityPool.load(id);

  if (liquidityPool == null) {
    liquidityPool = new LiquidityPool(id);
    liquidityPool.shares = BigInt.fromI32(0);
    liquidityPool.openInterestShares = BigInt.fromI32(0);
    liquidityPool.assets = BigInt.fromI32(0);
  }

  liquidityPool.save();

  return liquidityPool as LiquidityPool;
}

// Called from trade-pair.ts
export function removeOpenInterestFromLiquidityPool(
  liquidityPoolId: string | null,
  shares: BigInt
): void {
  if (liquidityPoolId == null) {
    return;
  }
  let liquidityPool = getLiquidityPool(liquidityPoolId as string);
  liquidityPool.openInterestShares = liquidityPool.openInterestShares.minus(
    shares
  );
  liquidityPool.save();
}

export function handleDeposit(event: DepositEvent): void {
  log.info("handleDeposit", []);

  let liquidityPool = getLiquidityPool(event.address.toHex());

  // Shares get increased at Transfer event
  liquidityPool.openInterestShares = liquidityPool.openInterestShares.plus(
    event.params.shares
  );
  liquidityPool.assets = liquidityPool.assets.plus(event.params.assets);

  liquidityPool.save();
}

export function handleRedeem(event: RedeemEvent): void {
  let liquidityPool = getLiquidityPool(event.address.toHex());

  // Shares get decreased at Transfer event
  liquidityPool.assets = liquidityPool.assets.minus(event.params.assets);
  liquidityPool.save();

  if (liquidityPool.protocol) {
    let protocol = getProtocol(liquidityPool.protocol as string);
    protocol.totalShares = protocol.totalShares.plus(
      event.params.protocolShares
    );
    protocol.save();
  }
}

export function handleTransfer(event: TransferEvent): void {
  let liquidityPool = getLiquidityPool(event.address.toHex());

  // burn
  if (event.params.to == ZERO_ADDRESS) {
    liquidityPool.shares = liquidityPool.shares.minus(event.params.value);
  }

  // mint
  if (event.params.from == ZERO_ADDRESS) {
    liquidityPool.shares = liquidityPool.shares.plus(event.params.value);
  }

  liquidityPool.save();
}

export function handleProtocolSet(event: ProtocolSetEvent): void {
  let protocol = getProtocol(event.params.protocol.toHex());
  let liquidityPool = getLiquidityPool(event.address.toHex());
  liquidityPool.protocol = protocol.id;
  liquidityPool.save();
}

export function previewRedeem(
  liquidityPoolId: string | null,
  shares: BigInt
): BigInt {
  if (liquidityPoolId == null) {
    return BigInt.fromI32(0);
  }

  let liquidityPool = getLiquidityPool(liquidityPoolId as string);

  if (liquidityPool.shares == BigInt.fromI32(0)) {
    return BigInt.fromI32(0);
  }
  return liquidityPool.assets.times(shares).div(liquidityPool.shares);
}

export function getLpRatio(liquidityPoolId: string | null): BigInt {
  if (liquidityPoolId == null) {
    return BigInt.fromI32(1);
  }

  let liquidityPool = getLiquidityPool(liquidityPoolId as string);

  // This will hopefully never happen, but when it does, we don't want to divide by zero
  if (
    liquidityPool.shares == BigInt.fromI32(0) ||
    liquidityPool.assets == BigInt.fromI32(0)
  ) {
    return BigInt.fromI32(1);
  }

  return liquidityPool.shares.div(liquidityPool.assets);
}

export function getLpRatioBefore(
  liquidityPoolId: string | null,
  pnlShares: BigInt
): BigInt {
  if (liquidityPoolId == null) {
    return BigInt.fromI32(1);
  }

  let liquidityPool = getLiquidityPool(liquidityPoolId as string);

  // This will hopefully never happen, but when it does, we don't want to divide by zero
  if (
    liquidityPool.shares == BigInt.fromI32(0) ||
    liquidityPool.assets == BigInt.fromI32(0)
  ) {
    return BigInt.fromI32(1);
  }

  log.info("pnlShares {}", [pnlShares.toString()]);

  log.info("shares {}", [liquidityPool.shares.toString()]);

  let sharesBefore = liquidityPool.shares;
  if (pnlShares.gt(BigInt.fromI32(0))) {
    sharesBefore = sharesBefore.minus(pnlShares);
  } else {
    // 99% will be burned (1% goes to protocol)
    sharesBefore = sharesBefore.minus(
      pnlShares.times(BigInt.fromI32(99)).div(BigInt.fromI32(100))
    );
  }

  log.info("sharesBefore {}", [sharesBefore.toString()]);

  return sharesBefore.div(liquidityPool.assets);
}
