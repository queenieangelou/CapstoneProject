import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Part from './mongodb/models/part.js';
import Procurement from './mongodb/models/procurement.js';
import Deployment from './mongodb/models/deployment.js';
import Expense from './mongodb/models/expense.js';
import Sale from './mongodb/models/sale.js';
import User from './mongodb/models/user.js';
import connectDB from './mongodb/connect.js';

dotenv.config();

// Sample data arrays
const partsList = [
  { partName: 'Engine Oil Filter', brandName: 'Toyota' },
  { partName: 'Air Filter', brandName: 'Honda' },
  { partName: 'Brake Pads', brandName: 'Nissan' },
  { partName: 'Spark Plugs', brandName: 'Bosch' },
  { partName: 'Timing Belt', brandName: 'Gates' },
  { partName: 'Battery', brandName: 'Motolite' },
  { partName: 'Alternator', brandName: 'Denso' },
  { partName: 'Radiator', brandName: 'Koyorad' },
  { partName: 'Shock Absorber', brandName: 'KYB' },
  { partName: 'Fuel Pump', brandName: 'Airtex' }
];

const supplierNames = [
  'AutoParts Plus',
  'Parts Hub Manila',
  'MegaParts Trading',
  'Premium Auto Supply',
  'Philippine Auto Parts'
];

const vehicleModels = [
  'Toyota Vios',
  'Honda Civic',
  'Mitsubishi Mirage',
  'Nissan Navara',
  'Hyundai Accent',
  'Toyota Fortuner',
  'Ford Ranger',
  'Suzuki Jimny'
];

const clientNames = [
  'Metro Motors Corp',
  'Capital Car Care',
  'Supreme Auto Services',
  'Elite Vehicle Solutions',
  'Premium Car Care Center',
  'FastTrack Auto',
  'AutoCare Philippines',
  'Pioneer Motors',
  'Golden Star Motors',
  'Reliable Auto Services'
];

// Helper function to generate random boolean values
const getRandomBoolean = () => Math.random() > 0.5;

// Helper function to generate random date (within a specific range)
const getRandomDate = (startDate, endDate) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

const generateTrackCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array(8).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const generateTIN = () => Array(12).fill(0).map(() => Math.floor(Math.random() * 10)).join('');

const generateAddress = () => {
  const streets = ['Makati Ave', 'EDSA', 'Quezon Ave', 'Ortigas Ave', 'Shaw Blvd'];
  const cities = ['Makati', 'Quezon City', 'Pasig', 'Mandaluyong', 'Taguig'];
  return `${Math.floor(Math.random() * 1000) + 1} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`;
};

const generateRandomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// Seed function
async function seedDatabase() {
  try {
    await connectDB(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Get a user for creator reference
    const user = await User.findOne();
    if (!user) {
      console.log('Please ensure at least one user exists in the database');
      process.exit(1);
    }

    // Clear existing data
    await Part.deleteMany({});
    await Procurement.deleteMany({});
    await Deployment.deleteMany({});
    await Expense.deleteMany({});
    await Sale.deleteMany({});
    console.log('Cleared existing data');

    // Create parts
    const createdParts = await Part.insertMany(
      partsList.map(part => ({
        ...part,
        qtyLeft: 0,
        deleted: getRandomBoolean(),  // Add random deleted field
        deletedAt: getRandomBoolean() ? getRandomDate(new Date(2020, 0, 1), new Date()) : null, // If deleted, set a date
      }))
    );
    console.log(`Created ${createdParts.length} parts`);

    // Create procurements
    const procurements = [];
    let procurementSeq = 1;

    for (const part of createdParts) {
      const numProcurements = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numProcurements; i++) {
        const quantityBought = Math.floor(Math.random() * 50) + 10;
        const amount = Math.floor(Math.random() * 10000) + 1000;
        const netOfVAT = amount / 1.12;
        const inputVAT = amount - netOfVAT;

        procurements.push({
          seq: procurementSeq++,
          date: generateRandomDate(new Date(2024, 0, 1), new Date()),
          supplierName: supplierNames[Math.floor(Math.random() * supplierNames.length)],
          reference: `PO-${Math.floor(Math.random() * 10000)}`,
          tin: generateTIN(),
          address: generateAddress(),
          part: part._id,
          description: `Procurement of ${part.partName}`,
          quantityBought,
          amount,
          netOfVAT: parseFloat(netOfVAT.toFixed(2)),
          inputVAT: parseFloat(inputVAT.toFixed(2)),
          isNonVat: false,
          noValidReceipt: false,
          creator: user._id,
          deleted: getRandomBoolean(),
          deletedAt: getRandomBoolean() ? getRandomDate(new Date(2020, 0, 1), new Date()) : null,
        });
        part.qtyLeft += quantityBought;
      }
      await part.save();
    }

    const createdProcurements = await Procurement.insertMany(procurements);
    console.log(`Created ${createdProcurements.length} procurements`);

    // Create deployments
    const deployments = [];
    let deploymentSeq = 1;

    for (let i = 0; i < 20; i++) {
      const numParts = Math.floor(Math.random() * 3) + 1;
      const selectedParts = createdParts
        .sort(() => 0.5 - Math.random())
        .slice(0, numParts)
        .map(part => ({
          part: part._id,
          quantityUsed: Math.floor(Math.random() * 5) + 1
        }));

      const arrivalDate = generateRandomDate(new Date(2024, 0, 1), new Date());
      const deploymentDate = generateRandomDate(new Date(arrivalDate), new Date());
      const releaseDate = generateRandomDate(new Date(deploymentDate), new Date());

      deployments.push({
        seq: deploymentSeq++,
        date: arrivalDate,
        clientName: clientNames[Math.floor(Math.random() * clientNames.length)],
        vehicleModel: vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
        arrivalDate,
        parts: selectedParts,
        deploymentStatus: true,
        deploymentDate,
        releaseStatus: Math.random() > 0.3,
        releaseDate,
        creator: user._id,
        repairStatus: ['Pending', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)],
        repairedDate: deploymentDate,
        trackCode: generateTrackCode(),
        deleted: getRandomBoolean(),
        deletedAt: getRandomBoolean() ? getRandomDate(new Date(2020, 0, 1), new Date()) : null,
      });
    }

    const createdDeployments = await Deployment.insertMany(deployments);
    console.log(`Created ${createdDeployments.length} deployments`);

    // Create sales
    const sales = [];
    let saleSeq = 1;

    for (const deployment of createdDeployments) {
      if (deployment.releaseStatus) {
        const amount = Math.floor(Math.random() * 50000) + 20000;
        const netOfVAT = amount / 1.12;
        const outputVAT = amount - netOfVAT;

        sales.push({
          seq: saleSeq++,
          date: deployment.releaseDate,
          clientName: deployment.clientName,
          tin: generateTIN(),
          amount,
          netOfVAT: parseFloat(netOfVAT.toFixed(2)),
          outputVAT: parseFloat(outputVAT.toFixed(2)),
          creator: user._id,
          deleted: getRandomBoolean(),
          deletedAt: getRandomBoolean() ? getRandomDate(new Date(2020, 0, 1), new Date()) : null,
        });
      }
    }

    for (let i = 0; i < 15; i++) {
      const amount = Math.floor(Math.random() * 100000) + 30000;
      const netOfVAT = amount / 1.12;
      const outputVAT = amount - netOfVAT;

      sales.push({
        seq: saleSeq++,
        date: generateRandomDate(new Date(2024, 0, 1), new Date()),
        clientName: clientNames[Math.floor(Math.random() * clientNames.length)],
        tin: generateTIN(),
        amount,
        netOfVAT: parseFloat(netOfVAT.toFixed(2)),
        outputVAT: parseFloat(outputVAT.toFixed(2)),
        creator: user._id,
        deleted: getRandomBoolean(),
        deletedAt: getRandomBoolean() ? getRandomDate(new Date(2020, 0, 1), new Date()) : null,
      });
    }

    const createdSales = await Sale.insertMany(sales);
    console.log(`Created ${createdSales.length} sales`);

    // Create expenses
    const expenses = [];
    let expenseSeq = 1;

    for (let i = 0; i < 30; i++) {
      const amount = Math.floor(Math.random() * 50000) + 5000;
      const isNonVat = Math.random() > 0.8;
      const netOfVAT = isNonVat ? amount : amount / 1.12;
      const inputVAT = isNonVat ? 0 : amount - netOfVAT;

      expenses.push({
        seq: expenseSeq++,
        date: generateRandomDate(new Date(2024, 0, 1), new Date()),
        supplierName: supplierNames[Math.floor(Math.random() * supplierNames.length)],
        ref: `EXP-${Math.floor(Math.random() * 10000)}`,
        tin: generateTIN(),
        address: generateAddress(),
        description: ['Office Supplies', 'Utilities', 'Rent', 'Equipment', 'Services'][Math.floor(Math.random() * 5)],
        amount,
        netOfVAT: parseFloat(netOfVAT.toFixed(2)),
        inputVAT: parseFloat(inputVAT.toFixed(2)),
        isNonVat,
        noValidReceipt: Math.random() > 0.9,
        creator: user._id,
        deleted: getRandomBoolean(),
        deletedAt: getRandomBoolean() ? getRandomDate(new Date(2020, 0, 1), new Date()) : null,
      });
    }

    const createdExpenses = await Expense.insertMany(expenses);
    console.log(`Created ${createdExpenses.length} expenses`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();