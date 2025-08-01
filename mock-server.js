// Backend server with MongoDB integration for Center Delaa Hawanem
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = 'centerwork';

// Connect to MongoDB
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB (centerwork)');
    db = client.db(dbName);
  })
  .catch(error => console.error('MongoDB connection error:', error));

// Helper function to get collection
const getCollection = (collectionName) => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection(collectionName);
};

// Mock authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Mock token validation (in real app, you'd verify JWT)
  if (token.startsWith('mock-jwt-token-') || token.length > 10) {
    req.user = { id: 1, role: 'admin' };
    next();
  } else {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Mock sign-in endpoint
app.post('/api/sample/auth/signin', (req, res) => {
  const { userName, password } = req.body;

  console.log('Sign-in attempt:', { userName, password });

  // Mock authentication logic
  if (userName === 'admin' && password === 'admin123') {
    res.json({
      accessToken: 'mock-jwt-token-' + Date.now(),
      role: 'admin',
      message: 'تم تسجيل الدخول بنجاح',
    });
  } else if (userName === 'user' && password === 'user123') {
    res.json({
      accessToken: 'mock-jwt-token-' + Date.now(),
      role: 'user',
      message: 'تم تسجيل الدخول بنجاح',
    });
  } else {
    res.status(401).json({
      message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    });
  }
});

// Center Delaa Hawanem Account endpoints
app.get('/api/center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('centerDelaaHawanemAccounts');
    const accounts = await collection.find({}).toArray();
    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

app.post('/api/center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('centerDelaaHawanemAccounts');
    const accountData = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const result = await collection.insertOne(accountData);
    res.status(201).json({ 
      message: 'تم الانشاء بنجاح', 
      account: { ...accountData, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'خطأ في إنشاء الحساب' });
  }
});

app.put('/api/center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('centerDelaaHawanemAccounts');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم التحديث بنجاح' });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: 'خطأ في تحديث الحساب' });
  }
});

app.delete('/api/center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('centerDelaaHawanemAccounts');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'خطأ في حذف الحساب' });
  }
});

// Mahmoud Center Delaa Hawanem endpoints
app.get('/api/mahmoud-center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('mahmoudCenterDelaaHawanemAccounts');
    const accounts = await collection.find({}).toArray();
    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching mahmoud accounts:', error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

app.post('/api/mahmoud-center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('mahmoudCenterDelaaHawanemAccounts');
    const accountData = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const result = await collection.insertOne(accountData);
    res.status(201).json({ 
      message: 'تم الانشاء بنجاح', 
      account: { ...accountData, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Error creating mahmoud account:', error);
    res.status(500).json({ message: 'خطأ في إنشاء الحساب' });
  }
});

app.put('/api/mahmoud-center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('mahmoudCenterDelaaHawanemAccounts');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم التحديث بنجاح' });
  } catch (error) {
    console.error('Error updating mahmoud account:', error);
    res.status(500).json({ message: 'خطأ في تحديث الحساب' });
  }
});

app.delete('/api/mahmoud-center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('mahmoudCenterDelaaHawanemAccounts');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error('Error deleting mahmoud account:', error);
    res.status(500).json({ message: 'خطأ في حذف الحساب' });
  }
});

// Basem Center Delaa Hawanem endpoints
app.get('/api/basem-center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('basemCenterDelaaHawanemAccounts');
    const accounts = await collection.find({}).toArray();
    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching basem accounts:', error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

app.post('/api/basem-center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('basemCenterDelaaHawanemAccounts');
    const accountData = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const result = await collection.insertOne(accountData);
    res.status(201).json({ 
      message: 'تم الانشاء بنجاح', 
      account: { ...accountData, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Error creating basem account:', error);
    res.status(500).json({ message: 'خطأ في إنشاء الحساب' });
  }
});

app.put('/api/basem-center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('basemCenterDelaaHawanemAccounts');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم التحديث بنجاح' });
  } catch (error) {
    console.error('Error updating basem account:', error);
    res.status(500).json({ message: 'خطأ في تحديث الحساب' });
  }
});

app.delete('/api/basem-center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('basemCenterDelaaHawanemAccounts');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error('Error deleting basem account:', error);
    res.status(500).json({ message: 'خطأ في حذف الحساب' });
  }
});

// Waheed Center Delaa Hawanem endpoints
app.get('/api/waheed-center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('waheedCenterDelaaHawanemAccounts');
    const accounts = await collection.find({}).toArray();
    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching waheed accounts:', error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

app.post('/api/waheed-center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('waheedCenterDelaaHawanemAccounts');
    const accountData = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const result = await collection.insertOne(accountData);
    res.status(201).json({ 
      message: 'تم الانشاء بنجاح', 
      account: { ...accountData, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Error creating waheed account:', error);
    res.status(500).json({ message: 'خطأ في إنشاء الحساب' });
  }
});

app.put('/api/waheed-center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('waheedCenterDelaaHawanemAccounts');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم التحديث بنجاح' });
  } catch (error) {
    console.error('Error updating waheed account:', error);
    res.status(500).json({ message: 'خطأ في تحديث الحساب' });
  }
});

app.delete('/api/waheed-center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('waheedCenterDelaaHawanemAccounts');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error('Error deleting waheed account:', error);
    res.status(500).json({ message: 'خطأ في حذف الحساب' });
  }
});

// Emad Center Delaa Hawanem endpoints
app.get('/api/emad-center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('emadCenterDelaaHawanemAccounts');
    const accounts = await collection.find({}).toArray();
    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching emad accounts:', error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

app.post('/api/emad-center-delaa-hawanem-account', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('emadCenterDelaaHawanemAccounts');
    const accountData = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const result = await collection.insertOne(accountData);
    res.status(201).json({ 
      message: 'تم الانشاء بنجاح', 
      account: { ...accountData, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Error creating emad account:', error);
    res.status(500).json({ message: 'خطأ في إنشاء الحساب' });
  }
});

app.put('/api/emad-center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('emadCenterDelaaHawanemAccounts');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم التحديث بنجاح' });
  } catch (error) {
    console.error('Error updating emad account:', error);
    res.status(500).json({ message: 'خطأ في تحديث الحساب' });
  }
});

app.delete('/api/emad-center-delaa-hawanem-account/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('emadCenterDelaaHawanemAccounts');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error('Error deleting emad account:', error);
    res.status(500).json({ message: 'خطأ في حذف الحساب' });
  }
});

// Center Delaa Hawanem Sales endpoints
app.get('/api/center-delaa-hawanem-sales', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('centerDelaaHawanemSales');
    const sales = await collection.find({}).toArray();
    res.json({ sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

app.post('/api/center-delaa-hawanem-sales', authenticateToken, async (req, res) => {
  try {
    const collection = getCollection('centerDelaaHawanemSales');
    const salesData = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const result = await collection.insertOne(salesData);
    res.status(201).json({ 
      message: 'تم الانشاء بنجاح', 
      sales: { ...salesData, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Error creating sales:', error);
    res.status(500).json({ message: 'خطأ في إنشاء المبيعات' });
  }
});

app.put('/api/center-delaa-hawanem-sales/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('centerDelaaHawanemSales');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'المبيعات غير موجودة' });
    }
    res.json({ message: 'تم التحديث بنجاح' });
  } catch (error) {
    console.error('Error updating sales:', error);
    res.status(500).json({ message: 'خطأ في تحديث المبيعات' });
  }
});

app.delete('/api/center-delaa-hawanem-sales/:id', authenticateToken, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const collection = getCollection('centerDelaaHawanemSales');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'المبيعات غير موجودة' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error('Error deleting sales:', error);
    res.status(500).json({ message: 'خطأ في حذف المبيعات' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Test credentials:');
  console.log('Admin: username=admin, password=admin123');
  console.log('User: username=user, password=user123');
  console.log('');
  console.log('Available endpoints:');
  console.log('- POST /api/sample/auth/signin');
  console.log('- GET/POST/PUT/DELETE /api/center-delaa-hawanem-account');
  console.log('- GET/POST/PUT/DELETE /api/mahmoud-center-delaa-hawanem-account');
  console.log('- GET/POST/PUT/DELETE /api/basem-center-delaa-hawanem-account');
  console.log('- GET/POST/PUT/DELETE /api/waheed-center-delaa-hawanem-account');
  console.log('- GET/POST/PUT/DELETE /api/emad-center-delaa-hawanem-account');
  console.log('- GET/POST/PUT/DELETE /api/center-delaa-hawanem-sales');
});
