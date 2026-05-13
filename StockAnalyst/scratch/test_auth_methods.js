import PocketBase from 'pocketbase';

const pb = new PocketBase('https://stock-pb.indonesiastockanalyst.my.id');

async function test() {
    try {
        console.log('Fetching auth methods...');
        const methods = await pb.collection('users').listAuthMethods();
        console.log('Auth methods:', JSON.stringify(methods, null, 2));
    } catch (error) {
        console.error('Error fetching auth methods:', error);
    }
}

test();
