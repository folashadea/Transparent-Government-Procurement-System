import { describe, it, expect, beforeEach } from "vitest"
import { mockClarityBin } from "./mocks/clarity-mock"

// Mock the Clarity binary
const clarity = mockClarityBin()

describe("Bid Submission Contract", () => {
  beforeEach(() => {
    // Reset the mock state before each test
    clarity.resetState()
    
    // Deploy the contract
    clarity.deployContract("bid-submission")
  })
  
  it("should create a new tender successfully", async () => {
    const result = await clarity.executeContract({
      contract: "bid-submission",
      method: "create-tender",
      args: ["tender123", "Office Supplies", "Procurement of office supplies for Q3", "100000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    expect(result.success).toBe(true)
  })
  
  it("should not allow non-admin to create a tender", async () => {
    const result = await clarity.executeContract({
      contract: "bid-submission",
      method: "create-tender",
      args: ["tender123", "Office Supplies", "Procurement of office supplies for Q3", "100000"],
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", // Not admin
    })
    
    expect(result.success).toBe(false)
    expect(result.error).toBe(1) // Not authorized
  })
  
  it("should allow submitting a bid for an active tender", async () => {
    // Create tender
    await clarity.executeContract({
      contract: "bid-submission",
      method: "create-tender",
      args: ["tender123", "Office Supplies", "Procurement of office supplies for Q3", "100000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    // Submit bid
    const result = await clarity.executeContract({
      contract: "bid-submission",
      method: "submit-bid",
      args: ["tender123", "50000", "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"],
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", // Bidder
    })
    
    expect(result.success).toBe(true)
  })
  
  it("should not allow submitting multiple bids for the same tender", async () => {
    // Create tender
    await clarity.executeContract({
      contract: "bid-submission",
      method: "create-tender",
      args: ["tender123", "Office Supplies", "Procurement of office supplies for Q3", "100000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    // Submit first bid
    await clarity.executeContract({
      contract: "bid-submission",
      method: "submit-bid",
      args: ["tender123", "50000", "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"],
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", // Bidder
    })
    
    // Submit second bid
    const result = await clarity.executeContract({
      contract: "bid-submission",
      method: "submit-bid",
      args: ["tender123", "45000", "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"],
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", // Same bidder
    })
    
    expect(result.success).toBe(false)
    expect(result.error).toBe(7) // Bid already submitted
  })
  
  it("should retrieve tender information correctly", async () => {
    // Create tender
    await clarity.executeContract({
      contract: "bid-submission",
      method: "create-tender",
      args: ["tender123", "Office Supplies", "Procurement of office supplies for Q3", "100000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    // Get tender info
    const result = await clarity.executeContract({
      contract: "bid-submission",
      method: "get-tender",
      args: ["tender123"],
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    })
    
    expect(result.success).toBe(true)
    expect(result.result).toEqual({
      title: "Office Supplies",
      description: "Procurement of office supplies for Q3",
      deadline: 100000,
      "is-active": true,
      "created-by": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    })
  })
})

