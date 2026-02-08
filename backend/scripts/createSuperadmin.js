import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import User from '../src/models/userModel.js';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createSuperadmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✓ Connected to MongoDB\n');

        // Check if superadmin already exists
        const existingSuperadmin = await User.findOne({ role: 'superadmin' });

        if (existingSuperadmin) {
            console.log('⚠️  Warning: A superadmin already exists!');
            console.log(`   Email: ${existingSuperadmin.email}`);
            console.log(`   Name: ${existingSuperadmin.name}\n`);

            const proceed = await question('Do you want to create another superadmin? (yes/no): ');

            if (proceed.toLowerCase() !== 'yes') {
                console.log('\n❌ Operation cancelled.');
                process.exit(0);
            }
            console.log('');
        }

        // Get superadmin details
        console.log('=== Create Superadmin User ===\n');

        const name = await question('Full Name: ');
        const email = await question('Email: ');
        const phone = await question('Phone (optional): ');
        const password = await question('Password (min 8 chars): ');

        // Validate input
        if (!name || !email || !password) {
            console.error('\n✗ Name, email and password are required!');
            process.exit(1);
        }

        if (password.length < 8) {
            console.error('\n✗ Password must be at least 8 characters!');
            process.exit(1);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('\n✗ Invalid email format!');
            process.exit(1);
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error('\n✗ A user with this email already exists!');
            console.log(`   Current role: ${existingUser.role}`);

            if (existingUser.role === 'superadmin') {
                console.log('\n⚠️  This user is already a superadmin!');
                process.exit(1);
            }

            const upgrade = await question('\nUpgrade this user to superadmin? (yes/no): ');
            if (upgrade.toLowerCase() === 'yes') {
                existingUser.role = 'superadmin';
                existingUser.isActive = true;
                existingUser.password = await bcrypt.hash(password, 10);
                if (phone) existingUser.phone = phone;
                await existingUser.save();

                console.log('\n✓ User upgraded to superadmin successfully!');
                console.log(`✓ Name: ${existingUser.name}`);
                console.log(`✓ Email: ${existingUser.email}`);
                console.log(`✓ Role: ${existingUser.role}`);
                process.exit(0);
            } else {
                console.log('\n❌ Operation cancelled.');
                process.exit(1);
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create superadmin user
        const superadmin = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || undefined,
            role: 'superadmin',
            isActive: true,
            lastLogin: new Date()
        });

        console.log('\n✓ Superadmin created successfully!');
        console.log(`✓ Name: ${superadmin.name}`);
        console.log(`✓ Email: ${superadmin.email}`);
        console.log(`✓ Role: ${superadmin.role}`);
        console.log(`✓ ID: ${superadmin._id}`);
        console.log('\n🎉 You can now login to the admin panel with this email and password!');

        process.exit(0);
    } catch (error) {
        console.error('\n✗ Error creating superadmin:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await mongoose.connection.close();
    }
};

createSuperadmin();
