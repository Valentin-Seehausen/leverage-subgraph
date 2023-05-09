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
  liquidityPoolAddress,
  protocolAddress,
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

describe("LiquidityPool Tests", () => {
  beforeAll(() => {});

  afterEach(() => {
    clearStore();
  });

  test("Deposit", () => {
    handleDeposit(createDepositEvent(defaultAddress, collateral, shares));

    assert.entityCount("LiquidityPool", 1);

    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "shares",
      shares.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "openInterestShares",
      shares.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "assets",
      collateral.toString()
    );
  });

  test("Burn", () => {
    handleDeposit(createDepositEvent(defaultAddress, collateral, shares));
    handleTransfer(createTransferEvent(defaultAddress, ZERO_ADDRESS, shares));

    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "shares",
      shares.toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "openInterestShares",
      shares.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "assets",
      collateral.toString()
    );
  });

  test("Realized Profit", () => {
    // set liquidityPool
    handleLiquidityPoolSet(
      newEvent<LiquidityPoolSet>([
        ethereum.Value.fromAddress(liquidityPoolAddress),
      ])
    );

    let positionId = openDefaultPosition();
    handleDeposit(createDepositEvent(defaultAddress, collateral, shares));
    closeDefaultPosition(positionId);

    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "shares",
      shares.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "openInterestShares",
      "0"
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "assets",
      collateral.toString()
    );
  });

  test("Redeem", () => {
    handleProtocolSet(createProtocolSetEvent(protocolAddress));
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
      liquidityPoolAddress.toHex(),
      "shares",
      shares.toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "assets",
      collateral.div(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "Protocol",
      protocolAddress.toHex(),
      "totalShares",
      shares.toString()
    );
  });
});
