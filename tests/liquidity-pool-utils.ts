import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Approval,
  Deposit,
  ProtocolSet,
  Redeem,
  TradePairAdded,
  TradePairRemoved,
  Transfer,
} from "../generated/LiquidityPool/LiquidityPool";

export let shares = BigInt.fromI32(1_000_000_000);
export let assets = BigInt.fromI32(1_000_000);
export let liquidityPoolAddress = Address.fromString(
  "0x000000000000000000000000000000000000000b"
);
export let protocolAddress = Address.fromString(
  "0x000000000000000000000000000000000000000c"
);

export function createApprovalEvent(
  owner: Address,
  spender: Address,
  value: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent());

  approvalEvent.parameters = new Array();

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  );
  approvalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  );
  approvalEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  );

  approvalEvent.address = liquidityPoolAddress;

  return approvalEvent;
}

export function createDepositEvent(
  sender: Address,
  assets: BigInt,
  shares: BigInt
): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent());

  depositEvent.parameters = new Array();

  depositEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  );
  depositEvent.parameters.push(
    new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets))
  );
  depositEvent.parameters.push(
    new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares))
  );

  depositEvent.address = liquidityPoolAddress;

  return depositEvent;
}

export function createProtocolSetEvent(protocol: Address): ProtocolSet {
  let protocolSetEvent = changetype<ProtocolSet>(newMockEvent());

  protocolSetEvent.parameters = new Array();

  protocolSetEvent.parameters.push(
    new ethereum.EventParam("protocol", ethereum.Value.fromAddress(protocol))
  );

  protocolSetEvent.address = liquidityPoolAddress;

  return protocolSetEvent;
}

export function createRedeemEvent(
  sender: Address,
  assets: BigInt,
  shares: BigInt,
  protocolShares: BigInt
): Redeem {
  let redeemEvent = changetype<Redeem>(newMockEvent());

  redeemEvent.parameters = new Array();

  redeemEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  );
  redeemEvent.parameters.push(
    new ethereum.EventParam("assets", ethereum.Value.fromUnsignedBigInt(assets))
  );
  redeemEvent.parameters.push(
    new ethereum.EventParam("shares", ethereum.Value.fromUnsignedBigInt(shares))
  );
  redeemEvent.parameters.push(
    new ethereum.EventParam(
      "protocolShares",
      ethereum.Value.fromUnsignedBigInt(protocolShares)
    )
  );

  redeemEvent.address = liquidityPoolAddress;

  return redeemEvent;
}

export function createTradePairAddedEvent(tradePair: Address): TradePairAdded {
  let tradePairAddedEvent = changetype<TradePairAdded>(newMockEvent());

  tradePairAddedEvent.parameters = new Array();

  tradePairAddedEvent.parameters.push(
    new ethereum.EventParam("tradePair", ethereum.Value.fromAddress(tradePair))
  );

  tradePairAddedEvent.address = liquidityPoolAddress;

  return tradePairAddedEvent;
}

export function createTradePairRemovedEvent(
  tradePair: Address
): TradePairRemoved {
  let tradePairRemovedEvent = changetype<TradePairRemoved>(newMockEvent());

  tradePairRemovedEvent.parameters = new Array();

  tradePairRemovedEvent.parameters.push(
    new ethereum.EventParam("tradePair", ethereum.Value.fromAddress(tradePair))
  );

  tradePairRemovedEvent.address = liquidityPoolAddress;

  return tradePairRemovedEvent;
}

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent());

  transferEvent.parameters = new Array();

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  transferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  );

  transferEvent.address = liquidityPoolAddress;

  return transferEvent;
}
