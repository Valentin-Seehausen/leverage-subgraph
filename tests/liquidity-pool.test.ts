import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterEach,
} from "matchstick-as/assembly/index";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  ZERO_ADDRESS,
  handleDeposit,
  handleProtocolSet,
  handleRedeem,
  handleTransfer,
} from "../src/liquidity-pool";
import {
  createDepositEvent,
  createProtocolSetEvent,
  createRedeemEvent,
  createTransferEvent,
  liquidityPool,
  protocol,
} from "./liquidity-pool-utils";
import { defaultAddress, newEvent } from "./utils/event.utils";
import {
  closeDefaultPosition,
  collateral,
  openDefaultPosition,
  shares,
} from "./trade-pair-utils";
import { handleLiquidityPoolSet } from "../src/trade-pair";
import { LiquidityPoolSet } from "../generated/TradePair/TradePair";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {});

  afterEach(() => {
    clearStore();
  });

  test("Deposit", () => {
    handleDeposit(createDepositEvent(defaultAddress, collateral, shares));

    assert.entityCount("LiquidityPool", 1);

    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "shares",
      shares.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "openInterestShares",
      shares.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "assets",
      collateral.toString()
    );
  });

  test("Burn", () => {
    handleDeposit(createDepositEvent(defaultAddress, collateral, shares));
    handleTransfer(createTransferEvent(defaultAddress, ZERO_ADDRESS, shares));

    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "shares",
      shares.toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "openInterestShares",
      shares.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "assets",
      collateral.toString()
    );
  });

  test("Realized Profit", () => {
    // set liquidityPool
    handleLiquidityPoolSet(
      newEvent<LiquidityPoolSet>([ethereum.Value.fromAddress(liquidityPool)])
    );

    let positionId = openDefaultPosition();
    handleDeposit(createDepositEvent(defaultAddress, collateral, shares));
    closeDefaultPosition(positionId);

    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "shares",
      shares.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "openInterestShares",
      "0"
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "assets",
      collateral.toString()
    );
  });

  test("Redeem", () => {
    handleProtocolSet(createProtocolSetEvent(protocol));
    handleDeposit(createDepositEvent(defaultAddress, collateral, shares));
    handleRedeem(
      createRedeemEvent(
        defaultAddress,
        collateral.div(BigInt.fromI32(2)),
        shares,
        shares
      )
    );

    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "shares",
      shares.toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPool.toHex(),
      "assets",
      collateral.div(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "Protocol",
      protocol.toHex(),
      "totalShares",
      shares.toString()
    );
  });
});
