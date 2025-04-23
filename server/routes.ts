import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAdminSchema,
  insertResellerSchema, 
  insertKeySchema, 
  keyVerificationSchema, 
  addCreditsSchema,
  gameEnum
} from "@shared/schema";
import { nanoid } from "nanoid";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure data directory exists for reseller files
  const dataDir = path.join('.', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory for reseller files');
  }

  // Set up session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: "keymaster-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000 // 24 hours
      }),
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 } // 24 hours
    })
  );

  // Set up passport authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport strategies
  passport.use('admin', new LocalStrategy(async (username, password, done) => {
    try {
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      if (admin.password !== password) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      return done(null, { id: admin.id, username: admin.username, role: 'admin' });
    } catch (err) {
      return done(err);
    }
  }));

  passport.use('reseller', new LocalStrategy(async (username, password, done) => {
    try {
      const reseller = await storage.getResellerByUsername(username);
      if (!reseller) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      if (reseller.password !== password) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      if (!reseller.isActive) {
        return done(null, false, { message: 'Account is suspended' });
      }
      return done(null, { id: reseller.id, username: reseller.username, role: 'reseller' });
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, JSON.stringify(user));
  });

  passport.deserializeUser((serializedUser: string, done) => {
    done(null, JSON.parse(serializedUser));
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as any).role === 'admin') {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };

  const isReseller = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as any).role === 'reseller') {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };

  // Auth routes
  app.post('/api/auth/admin/login', (req, res, next) => {
    passport.authenticate('admin', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ user });
      });
    })(req, res, next);
  });

  app.post('/api/auth/reseller/login', (req, res, next) => {
    passport.authenticate('reseller', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ user });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/session', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ isAuthenticated: true, user: req.user });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Registration route
  app.post('/api/auth/reseller/register', async (req, res) => {
    try {
      const resellerData = insertResellerSchema.parse(req.body);
      
      // Check if username exists
      const existingReseller = await storage.getResellerByUsername(resellerData.username);
      if (existingReseller) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Check if token exists and is not used
      const token = await storage.getToken(resellerData.referralToken);
      if (!token || token.isUsed) {
        return res.status(400).json({ message: 'Invalid or already used referral token' });
      }
      
      // Create reseller
      const reseller = await storage.createReseller(resellerData);
      
      // Mark token as used
      await storage.useToken(resellerData.referralToken, resellerData.username);
      
      // Create a JSON file for the reseller's keys
      try {
        const resellerFilePath = path.join(dataDir, `${reseller.username}.json`);
        const initialData = {
          resellerId: reseller.id,
          username: reseller.username,
          keys: []
        };
        fs.writeFileSync(resellerFilePath, JSON.stringify(initialData, null, 2));
        console.log(`Created key file for reseller: ${reseller.username}`);
      } catch (fileError) {
        console.error(`Error creating reseller key file: ${fileError.message}`);
        // Continue even if file creation fails
      }
      
      res.status(201).json({ 
        success: true, 
        message: 'Registration successful',
        reseller: {
          id: reseller.id,
          username: reseller.username,
          credits: reseller.credits,
          registrationDate: reseller.registrationDate
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/resellers', isAdmin, async (req, res) => {
    try {
      const resellers = await storage.getAllResellers();
      const resellersWithStats = await Promise.all(
        resellers.map(async (reseller) => {
          const keys = await storage.getKeysByResellerId(reseller.id);
          const now = new Date();
          const activeKeys = keys.filter(key => !key.isRevoked && new Date(key.expiryDate) > now).length;
          return {
            ...reseller,
            totalKeys: keys.length,
            activeKeys
          };
        })
      );
      res.json(resellersWithStats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/admin/resellers/credits', isAdmin, async (req, res) => {
    try {
      const { resellerId, amount } = addCreditsSchema.parse(req.body);
      
      const reseller = await storage.getReseller(resellerId);
      if (!reseller) {
        return res.status(404).json({ message: 'Reseller not found' });
      }
      
      const updatedReseller = await storage.updateResellerCredits(resellerId, amount);
      res.json({
        success: true,
        reseller: updatedReseller
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/admin/resellers/:id/toggle-status', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean' });
      }
      
      const reseller = await storage.getReseller(id);
      if (!reseller) {
        return res.status(404).json({ message: 'Reseller not found' });
      }
      
      const updatedReseller = await storage.updateResellerStatus(id, isActive);
      res.json({
        success: true,
        reseller: updatedReseller
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/admin/tokens/generate', isAdmin, async (req, res) => {
    try {
      const token = await storage.createToken();
      res.status(201).json({
        success: true,
        token
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/tokens', isAdmin, async (req, res) => {
    try {
      const tokens = await storage.getAllTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reseller routes
  app.get('/api/reseller/profile', isReseller, async (req, res) => {
    try {
      const user = req.user as any;
      const reseller = await storage.getReseller(user.id);
      if (!reseller) {
        return res.status(404).json({ message: 'Reseller not found' });
      }
      
      const keys = await storage.getKeysByResellerId(reseller.id);
      const now = new Date();
      const activeKeys = keys.filter(key => !key.isRevoked && new Date(key.expiryDate) > now).length;
      const expiredKeys = keys.filter(key => !key.isRevoked && new Date(key.expiryDate) <= now).length;
      
      res.json({
        id: reseller.id,
        username: reseller.username,
        credits: reseller.credits,
        registrationDate: reseller.registrationDate,
        activeKeys,
        expiredKeys,
        totalKeys: keys.length
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/reseller/keys', isReseller, async (req, res) => {
    try {
      const user = req.user as any;
      const keys = await storage.getKeysByResellerId(user.id);
      
      // Get device count for each key
      const keysWithDevices = await Promise.all(
        keys.map(async (key) => {
          const devices = await storage.getDevicesByKeyId(key.id);
          const now = new Date();
          let status = key.isRevoked ? "REVOKED" : 
                      (new Date(key.expiryDate) <= now ? "EXPIRED" : "ACTIVE");
          
          return {
            ...key,
            devices: devices.length,
            status
          };
        })
      );
      
      res.json(keysWithDevices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/reseller/keys/generate', isReseller, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Log request data for debugging
      console.log("Incoming key generation request:", req.body);
      
      // Ensure expiryDate is properly formatted as a Date object
      const formData = { 
        ...req.body,
        // Parse expiryDate string to Date if it's a string
        expiryDate: req.body.expiryDate instanceof Date 
          ? req.body.expiryDate 
          : new Date(req.body.expiryDate)
      };
      
      // Validate data with schema
      const keyData = insertKeySchema.parse(formData);
      
      // Log parsed data
      console.log("Parsed key data:", keyData);
      
      // Validate game enum
      try {
        gameEnum.parse(keyData.game);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid game selection' });
      }
      
      // Check if custom key already exists
      if (keyData.keyString) {
        const existingKey = await storage.getKey(keyData.keyString);
        if (existingKey) {
          return res.status(400).json({ message: 'This key already exists' });
        }
      }
      
      // Check reseller credits
      const reseller = await storage.getReseller(user.id);
      if (!reseller) {
        return res.status(404).json({ message: 'Reseller not found' });
      }
      
      const count = req.body.count || 1;
      if (reseller.credits < count) {
        return res.status(400).json({ message: 'Insufficient credits' });
      }
      
      // Generate keys
      const generatedKeys = [];
      for (let i = 0; i < count; i++) {
        const keyString = keyData.keyString || generateKeyString(keyData.game);
        const key = await storage.createKey({
          ...keyData,
          keyString: i === 0 ? keyString : generateKeyString(keyData.game),
          resellerId: user.id
        });
        generatedKeys.push(key);
      }
      
      // Deduct credits
      await storage.updateResellerCredits(user.id, -count);
      
      // Also save keys to the reseller's JSON file
      try {
        const resellerFilePath = path.join(dataDir, `${reseller.username}.json`);
        
        // Check if file exists, if not create it
        if (!fs.existsSync(resellerFilePath)) {
          const initialData = {
            resellerId: reseller.id,
            username: reseller.username,
            keys: []
          };
          fs.writeFileSync(resellerFilePath, JSON.stringify(initialData, null, 2));
          console.log(`Created new key file for reseller: ${reseller.username}`);
        }
        
        // Read current file data
        const fileData = JSON.parse(fs.readFileSync(resellerFilePath, 'utf8'));
        
        // Add new keys to the data
        generatedKeys.forEach(key => {
          fileData.keys.push({
            ...key,
            createdAt: new Date().toISOString(), // Ensure proper date format
            expiryDate: key.expiryDate.toISOString() // Ensure proper date format
          });
        });
        
        // Write updated data back to file
        fs.writeFileSync(resellerFilePath, JSON.stringify(fileData, null, 2));
        console.log(`Added ${generatedKeys.length} key(s) to ${reseller.username}'s file`);
      } catch (fileError) {
        console.error(`Error updating reseller key file: ${fileError.message}`);
        // Continue even if file update fails
      }
      
      res.status(201).json({
        success: true,
        keys: generatedKeys,
        remainingCredits: reseller.credits - count
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/reseller/keys/:id/revoke', isReseller, async (req, res) => {
    try {
      const keyId = parseInt(req.params.id);
      const user = req.user as any;
      
      // Find the key
      const keys = await storage.getKeysByResellerId(user.id);
      const key = keys.find(k => k.id === keyId);
      
      if (!key) {
        return res.status(404).json({ message: 'Key not found or does not belong to you' });
      }
      
      // Revoke the key
      const revokedKey = await storage.revokeKey(keyId);
      
      res.json({
        success: true,
        key: revokedKey
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/reseller/keys/:id', isReseller, async (req, res) => {
    try {
      const keyId = parseInt(req.params.id);
      const user = req.user as any;
      
      // Find the key
      const keys = await storage.getKeysByResellerId(user.id);
      const key = keys.find(k => k.id === keyId);
      
      if (!key) {
        return res.status(404).json({ message: 'Key not found or does not belong to you' });
      }
      
      // Get devices associated with the key
      const devices = await storage.getDevicesByKeyId(keyId);
      
      // Calculate status
      const now = new Date();
      let status = key.isRevoked ? "REVOKED" : 
                  (new Date(key.expiryDate) <= now ? "EXPIRED" : "ACTIVE");
      
      res.json({
        ...key,
        devices,
        status
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/reseller/keys/:id/devices/:deviceId/remove', isReseller, async (req, res) => {
    try {
      const keyId = parseInt(req.params.id);
      const deviceId = req.params.deviceId;
      const user = req.user as any;
      
      // Find the key
      const keys = await storage.getKeysByResellerId(user.id);
      const key = keys.find(k => k.id === keyId);
      
      if (!key) {
        return res.status(404).json({ message: 'Key not found or does not belong to you' });
      }
      
      // Remove the device
      const success = await storage.removeDevice(deviceId, keyId);
      
      if (!success) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      res.json({
        success: true,
        message: 'Device removed successfully'
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public API for key verification
  app.post('/api/verify', async (req, res) => {
    try {
      const { key: keyString, deviceId, game } = keyVerificationSchema.parse(req.body);
      
      // Find the key
      const key = await storage.getKey(keyString);
      
      // Key not found
      if (!key) {
        return res.json({
          valid: false,
          message: "Invalid license key"
        });
      }
      
      // Check if key is for the right game
      if (key.game !== game) {
        return res.json({
          valid: false,
          message: "License key is not valid for this game"
        });
      }
      
      // Check if key is revoked
      if (key.isRevoked) {
        return res.json({
          valid: false,
          message: "License key has been revoked"
        });
      }
      
      // Check if key is expired
      const now = new Date();
      if (new Date(key.expiryDate) <= now) {
        return res.json({
          valid: false,
          message: "License key has expired",
          expiry: key.expiryDate
        });
      }
      
      // Get devices for this key
      const devices = await storage.getDevicesByKeyId(key.id);
      
      // Check if device is already registered
      const deviceExists = devices.some(d => d.deviceId === deviceId);
      
      // If device exists, return success
      if (deviceExists) {
        return res.json({
          valid: true,
          expiry: key.expiryDate,
          deviceLimit: key.deviceLimit,
          currentDevices: devices.length,
          message: "License valid"
        });
      }
      
      // Check device limit
      if (devices.length >= key.deviceLimit) {
        return res.json({
          valid: false,
          expiry: key.expiryDate,
          deviceLimit: key.deviceLimit,
          currentDevices: devices.length,
          message: "Device limit reached for this license key"
        });
      }
      
      // Register new device
      await storage.addDevice({
        keyId: key.id,
        deviceId
      });
      
      // Return success
      return res.json({
        valid: true,
        expiry: key.expiryDate,
        deviceLimit: key.deviceLimit,
        currentDevices: devices.length + 1,
        message: "License valid"
      });
    } catch (error) {
      res.status(400).json({ 
        valid: false,
        message: error.message 
      });
    }
  });

  // Helper functions
  function generateKeyString(game: string): string {
    let prefix = "";
    
    if (game === "PUBG MOBILE") {
      prefix = "PBGM";
    } else if (game === "LAST ISLAND OF SURVIVAL") {
      prefix = "LIOS";
    } else if (game === "STANDOFF2") {
      prefix = "STDF";
    }
    
    const segments = [
      nanoid(5).toUpperCase(),
      nanoid(5).toUpperCase(),
      nanoid(5).toUpperCase()
    ];
    
    return `${prefix}-${segments.join('-')}`;
  }

  const httpServer = createServer(app);
  return httpServer;
}
