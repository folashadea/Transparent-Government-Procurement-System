import { describe, it, expect, beforeEach } from "vitest"
import { mockClarityBin } from "./mocks/clarity-mock"

// Mock the Clarity binary
const clarity = mockClarityBin()

describe("Contract Fulfillment Contract", () => {
  beforeEach(() => {
    // Reset the mock state before each test
    clarity.resetState()
    
    // Deploy the contract
    clarity.deployContract("contract-fulfillment")
  })
  
  it("should create a contract successfully", async () => {
    const result = await clarity.executeContract({
      contract: "contract-fulfillment",
      method: "create-contract",
      args: ["contract123", "tender123", "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", "200000", "1000000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    expect(result.success).toBe(true)
  })
  
  it("should add a milestone successfully", async () => {
    // First create a contract
    await clarity.executeContract({
      contract: "contract-fulfillment",
      method: "create-contract",
      args: ["contract123", "tender123", "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", "200000", "1000000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    // Then add a milestone
    const result = await clarity.executeContract({
      contract: "contract-fulfillment",
      method: "add-milestone",
      args: ["contract123", "1", "Initial delivery of supplies", "150000", "300000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    expect(result.success).toBe(true)
  })
  
  it("should complete a milestone successfully", async () => {
    // Create a contract
    await clarity.executeContract({
      contract: "contract-fulfillment",
      method: "create-contract",
      args: ["contract123", "tender123", "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", "200000", "1000000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    // Add a milestone
    await clarity.executeContract({
      contract: "contract-fulfillment",
      method: "add-milestone",
      args: ["contract123", "1", "Initial delivery of supplies", "150000", "300000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    // Complete the milestone
    const result = await clarity.executeContract({
      contract: "contract-fulfillment",
      method: "complete-milestone",
      args: ["contract123", "1"],
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", // Vendor
    })
    
    expect(result.success).toBe(true)
  })
  
  it("should retrieve contract information correctly", async () => {
    // Create a contract
    await clarity.executeContract({
      contract: "contract-fulfillment",
      method: "create-contract",
      args: ["contract123", "tender123", "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", "200000", "1000000"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin
    })
    
    // Get contract info
    const result = await clarity.executeContract({
      contract: "contract-fulfillment",
      method: "get-contract",
      args: ["contract123"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    })
    
    expect(result.success).toBe(true)
  })
})

