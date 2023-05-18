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
      "0" // Shares get increased at Transfer event
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "openInterestShares",
      shares.toString()
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "assets",
      collateral.toString()
    );
  });

  test("Mint", () => {
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));

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
      "0" // Handled in handleDeposit
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "assets",
      "0" // Handled in handleDeposit
    );
  });

  test("Burn", () => {
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    handleDeposit(createDepositEvent(defaultAddress, collateral, shares));
    handleTransfer(createTransferEvent(defaultAddress, ZERO_ADDRESS, shares));

    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "shares",
      "0" // Should decrease to 0
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "openInterestShares",
      shares.toString() // Handled at TradePair
    );
    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "assets",
      collateral.toString() // Handled at TradePair
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
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    closeDefaultPosition(positionId);
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));

    assert.fieldEquals(
      "LiquidityPool",
      liquidityPoolAddress.toHex(),
      "shares",
      shares.times(BigInt.fromI32(2)).toString() // Should have increasesd to 2x by minting
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
      collateral.toString() // But assets should still be the same
    );
  });

  test("Redeem", () => {
    handleProtocolSet(createProtocolSetEvent(protocolAddress));
    handleDeposit(createDepositEvent(defaultAddress, collateral, shares));
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    // Stimule profit
    handleTransfer(createTransferEvent(ZERO_ADDRESS, defaultAddress, shares));
    // And payout of half of the profit
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
      shares.times(BigInt.fromI32(2)).toString() // should stay at 2x, gets handled at burn event (not emitted here)
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
