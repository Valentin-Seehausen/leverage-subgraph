import { log, BigInt, Address } from "@graphprotocol/graph-ts";

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
  let liquidityPool = getLiquidityPool(event.address.toHex());

  liquidityPool.shares = liquidityPool.shares.plus(
    event.params.shares.times(BigInt.fromI32(2))
  );
  liquidityPool.openInterestShares = liquidityPool.openInterestShares.plus(
    event.params.shares.times(BigInt.fromI32(2))
  );
  liquidityPool.assets = liquidityPool.assets.plus(event.params.assets);

  liquidityPool.save();
}

export function handleRedeem(event: RedeemEvent): void {
  let liquidityPool = getLiquidityPool(event.address.toHex());

  liquidityPool.shares = liquidityPool.shares.minus(event.params.shares);
  liquidityPool.assets = liquidityPool.assets.minus(event.params.assets);
  liquidityPool.save();

  if (liquidityPool.protocol && liquidityPool.protocol) {
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
  return liquidityPool.assets.times(shares).div(liquidityPool.shares);
}
