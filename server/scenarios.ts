export const SCENARIOS = {
  "scenario-1": {
    name: "The Payroll Crash",
    description: "Payroll service is down. ProcessPayment is failing for null user IDs.",
    files: {
      "main.py": `
import time
from payment_processor import process_payment
from logger import log_error

print(">> Starting Payroll Batch...")
users = [{"id": 1, "amount": 500}, {"id": 2, "amount": 1200}, {"id": None, "amount": 800}]

for user in users:
    try:
        print(f"Processing user {user['id']}...")
        result = process_payment(user)
        print(f"Success: {result}")
    except Exception as e:
        log_error(f"CRITICAL FAILURE: {str(e)}")
`,
      "payment_processor.py": `
from db_connector import get_user_tier

def process_payment(user_data):
    # Logic: Calculate tax based on user tier
    user_id = user_data.get("id")
    amount = user_data.get("amount")

    # BUG: This function crashes if user_id is None
    tier = get_user_tier(user_id) 
    
    if tier == "GOLD":
        return amount * 0.95 # 5% discount
    return amount
`,
      "db_connector.py": `
def get_user_tier(user_id):
    # SIMULATED DATABASE CONNECTION
    # BUG IS HERE: No check for None. 
    # FIX: Add 'if user_id is None: return "STANDARD"'
    
    if user_id < 0:
        raise ValueError("Invalid ID")
    
    # Mock Database lookup
    db = {1: "STANDARD", 2: "GOLD"}
    return db.get(user_id, "STANDARD")
`,
      "logger.py": `
import datetime

def log_error(msg):
    # Just a helper to print timestamps
    print(f"[{datetime.datetime.now()}] ERROR: {msg}")
`
    },
    // --- UPDATED FOR COMPACT TERMINAL ---
    testScript: `
import sys

print("\\n[ TEST SUITE STARTED ]")

try:
    from payment_processor import process_payment
    
    # Test 1
    print("\\n1. User ID: 1 (Standard)")
    try:
        assert process_payment({"id": 1, "amount": 100}) == 100
        print("   -> STATUS: PASS")
    except:
        print("   -> STATUS: FAIL")
        raise
    
    # Test 2
    print("\\n2. User ID: 2 (Gold)")
    try:
        assert process_payment({"id": 2, "amount": 100}) == 95
        print("   -> STATUS: PASS")
    except:
        print("   -> STATUS: FAIL")
        raise
    
    # Test 3
    print("\\n3. User ID: None (Edge Case)")
    try:
        res = process_payment({"id": None, "amount": 100})
        print("   -> STATUS: PASS")
        print("\\n[ ALL TESTS PASSED ]")
        print("TEST_PASSED")
    except TypeError as e:
        print("   -> STATUS: FAIL")
        print("\\n!!! CRITICAL ERROR !!!")
        print("File: db_connector.py")
        print("Error: TypeError")
        print("Cause: Comparing None < 0")
        print("\\n[ HINT ]")
        print("Check if user_id is None")
        print("BEFORE doing the < 0 check.")
        raise e
    except Exception as e:
        print(f"TEST_FAILED: {e}")
        raise e

except Exception:
    pass
`
  }
};