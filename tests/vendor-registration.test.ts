import { describe, it, expect, beforeEach } from "vitest"
import { mockClarityBin } from "./mocks/clarity-mock"

// Mock the Clarity binary
const clarity = mockClarityBin()

describe("Vendor Registration Contract", () => {
  beforeEach(() => {
    // Reset the mock state before each test
    clarity.resetState()
    
    // Deploy the contract
    clarity.deployContract("vendor-registration")
  })
  
  it("should register a new vendor successfully", async () => {
    const result = await clarity.executeContract({
      contract: "vendor-registration",
      method: "register-vendor",
      args: ["vendor123", "Acme Corp", "Technology"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    })
    
    expect(result.success).toBe(true)
  })
  
  it("should not allow duplicate vendor IDs", async () => {
    // Register first vendor
    await clarity.executeContract({
      contract: "vendor-registration",
      method: "register-vendor",
      args: ["vendor123", "Acme Corp", "Technology"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    })
    
    // Try to register with the same ID
    const result = await clarity.executeContract({
      contract: "vendor-registration",
      method: "register-vendor",
      args: ["vendor123", "Different Corp", "Finance"],
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    })
    
    expect(result.success).toBe(false)
    expect(result.error).toBe(1) // Vendor ID already exists
  })
  
  it("should allow updating vendor status by admin", async () => {
    // Register vendor
    await clarity.executeContract({
      contract: "vendor-registration",
      method: "register-vendor",
      args: ["vendor123", "Acme Corp", "Technology"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    })
    
    // Update status as admin
    const result = await clarity.executeContract({
      contract: "vendor-registration",
      method: "update-vendor-status",
      args: ["vendor123", "false"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin is the deployer
    })
    
    expect(result.success).toBe(true)
  })
  
  it("should not allow unauthorized users to update vendor status", async () => {
    // Register vendor
    await clarity.executeContract({
      contract: "vendor-registration",
      method: "register-vendor",
      args: ["vendor123", "Acme Corp", "Technology"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    })
    
    // Try to update status as non-admin, non-vendor
    const result = await clarity.executeContract({
      contract: "vendor-registration",
      method: "update-vendor-status",
      args: ["vendor123", "false"],
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    })
    
    expect(result.success).toBe(false)
    expect(result.error).toBe(3) // Not authorized
  })
  
  it("should retrieve vendor information correctly", async () => {
    // Register vendor
    await clarity.executeContract({
      contract: "vendor-registration",
      method: "register-vendor",
      args: ["vendor123", "Acme Corp", "Technology"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    })
    
    // Get vendor info
    const result = await clarity.executeContract({
      contract: "vendor-registration",
      method: "get-vendor",
      args: ["vendor123"],
      sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    })
    
    expect(result.success).toBe(true)
    expect(result.result).toEqual({
      principal: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      name: "Acme Corp",
      "registration-date": expect.any(Number),
      "is-active": true,
      category: "Technology",
    })
  })
})

