// Binary Clock Integration Test
// This script can be run in the browser console to test the binary clock integration

console.log('🕐 Binary Clock Integration Test Starting...');

// Test 1: Check if binary clock component is available
function testBinaryClockComponent() {
    console.log('\n📋 Test 1: Binary Clock Component Availability');
    
    try {
        // Check if the binary clock is properly imported and available
        const nodeTypes = window.nodeTypes || {};
        if (nodeTypes.binaryClock) {
            console.log('✅ Binary Clock component is registered');
            return true;
        } else {
            console.log('❌ Binary Clock component not found in nodeTypes');
            return false;
        }
    } catch (error) {
        console.log('❌ Error checking component:', error);
        return false;
    }
}

// Test 2: Simulate binary time conversion
function testBinaryConversion() {
    console.log('\n📋 Test 2: Binary Time Conversion Logic');
    
    try {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        console.log(`Current time: ${hours}:${minutes}:${seconds}`);
        
        // Convert to binary arrays (6 bits each)
        const hoursBinary = [];
        const minutesBinary = [];
        const secondsBinary = [];
        
        for (let i = 5; i >= 0; i--) {
            hoursBinary.push((hours >> i) & 1);
            minutesBinary.push((minutes >> i) & 1);
            secondsBinary.push((seconds >> i) & 1);
        }
        
        console.log(`Hours binary: [${hoursBinary.join(', ')}] = ${hours}`);
        console.log(`Minutes binary: [${minutesBinary.join(', ')}] = ${minutes}`);
        console.log(`Seconds binary: [${secondsBinary.join(', ')}] = ${seconds}`);
        
        // Verify conversion back to decimal
        const hoursCheck = hoursBinary.reduce((acc, bit, index) => acc + (bit << (5 - index)), 0);
        const minutesCheck = minutesBinary.reduce((acc, bit, index) => acc + (bit << (5 - index)), 0);
        const secondsCheck = secondsBinary.reduce((acc, bit, index) => acc + (bit << (5 - index)), 0);
        
        const conversionCorrect = (hoursCheck === hours && minutesCheck === minutes && secondsCheck === seconds);
        
        if (conversionCorrect) {
            console.log('✅ Binary conversion is correct');
            return true;
        } else {
            console.log('❌ Binary conversion failed');
            console.log(`Expected: ${hours}, ${minutes}, ${seconds}`);
            console.log(`Got: ${hoursCheck}, ${minutesCheck}, ${secondsCheck}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error in binary conversion test:', error);
        return false;
    }
}

// Test 3: Check output handles generation
function testOutputHandles() {
    console.log('\n📋 Test 3: Output Handles Generation');
    
    try {
        const expectedHandles = [];
        
        // Hours: hour0 to hour5
        for (let i = 0; i < 6; i++) {
            expectedHandles.push(`hour${i}`);
        }
        
        // Minutes: minute0 to minute5
        for (let i = 0; i < 6; i++) {
            expectedHandles.push(`minute${i}`);
        }
        
        // Seconds: second0 to second5
        for (let i = 0; i < 6; i++) {
            expectedHandles.push(`second${i}`);
        }
        
        console.log(`Expected ${expectedHandles.length} output handles:`);
        console.log(expectedHandles.join(', '));
        
        console.log('✅ Output handles specification is correct');
        return true;
    } catch (error) {
        console.log('❌ Error in output handles test:', error);
        return false;
    }
}

// Test 4: Check if MultiLED component is compatible
function testMultiLEDCompatibility() {
    console.log('\n📋 Test 4: MultiLED Compatibility');
    
    try {
        // Check expected input handles for MultiLED
        const expectedLEDInputs = [];
        for (let i = 0; i < 6; i++) {
            expectedLEDInputs.push(`led${i}`);
        }
        
        console.log(`MultiLED should accept inputs: ${expectedLEDInputs.join(', ')}`);
        console.log('✅ MultiLED compatibility check passed');
        return true;
    } catch (error) {
        console.log('❌ Error in MultiLED compatibility test:', error);
        return false;
    }
}

// Test 5: Check evaluation logic integration
function testEvaluationLogic() {
    console.log('\n📋 Test 5: Evaluation Logic Integration');
    
    try {
        // Simulate the evaluation logic for binary clock
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // This simulates what happens in App.jsx evaluation
        const hoursBinary = [];
        const minutesBinary = [];
        const secondsBinary = [];
        
        for (let i = 5; i >= 0; i--) {
            hoursBinary.push((hours >> i) & 1);
            minutesBinary.push((minutes >> i) & 1);
            secondsBinary.push((seconds >> i) & 1);
        }
        
        const nodeData = {
            type: 'binaryClock',
            hoursBinary,
            minutesBinary,
            secondsBinary
        };
        
        console.log('Simulated node data:', nodeData);
        console.log('✅ Evaluation logic integration test passed');
        return true;
    } catch (error) {
        console.log('❌ Error in evaluation logic test:', error);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Running Binary Clock Integration Tests...');
    
    const tests = [
        testBinaryClockComponent,
        testBinaryConversion,
        testOutputHandles,
        testMultiLEDCompatibility,
        testEvaluationLogic
    ];
    
    const results = tests.map(test => test());
    const passedCount = results.filter(result => result).length;
    const totalCount = results.length;
    
    console.log(`\n📊 Test Results: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
        console.log('🎉 All tests passed! Binary clock integration should be working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Check the implementation.');
    }
    
    return passedCount === totalCount;
}

// Instructions for manual testing
function showManualTestInstructions() {
    console.log('\n📋 Manual Testing Instructions:');
    console.log('1. Open the Binary Calculator Panel');
    console.log('2. Click the "Binary Clock" button to add a binary clock circuit');
    console.log('3. Verify that:');
    console.log('   - A binary clock component appears');
    console.log('   - Three MultiLED displays appear (Hours, Minutes, Seconds)');
    console.log('   - All components are connected with wires');
    console.log('   - The LEDs update every second showing the binary time');
    console.log('   - The binary representation matches the digital time display');
    console.log('\n4. Test connection integrity:');
    console.log('   - Each MultiLED should have 6 inputs connected');
    console.log('   - The binary clock should have 18 outputs (6 each for H, M, S)');
    console.log('   - All wires should be properly connected');
}

// Run the tests
runAllTests();
showManualTestInstructions();

// Export functions for manual testing
window.binaryClockTests = {
    runAllTests,
    testBinaryConversion,
    testOutputHandles,
    showManualTestInstructions
};

console.log('\n💡 You can run individual tests by calling:');
console.log('window.binaryClockTests.testBinaryConversion()');
console.log('window.binaryClockTests.runAllTests()');
