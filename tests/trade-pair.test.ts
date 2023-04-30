import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { ChainlinkAggregatorSet } from "../generated/schema"
import { ChainlinkAggregatorSet as ChainlinkAggregatorSetEvent } from "../generated/TradePair/TradePair"
import { handleChainlinkAggregatorSet } from "../src/trade-pair"
import { createChainlinkAggregatorSetEvent } from "./trade-pair-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let aggregator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newChainlinkAggregatorSetEvent = createChainlinkAggregatorSetEvent(
      aggregator
    )
    handleChainlinkAggregatorSet(newChainlinkAggregatorSetEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ChainlinkAggregatorSet created and stored", () => {
    assert.entityCount("ChainlinkAggregatorSet", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ChainlinkAggregatorSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "aggregator",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
