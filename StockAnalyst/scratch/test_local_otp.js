import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function test() {
    try {
        console.log('Testing OTP request...');
        const result = await pb.collection('users').requestOTP('test@example.com');
        console.log('Result:', result);
    } catch (error) {
        console.error('Error status:', error.status);
        console.error('Error data:', JSON.stringify(error.data, null, 2));
    }
}

test();
