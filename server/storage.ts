import { 
  Admin, InsertAdmin, admins,
  Token, InsertToken, tokens,
  Reseller, InsertReseller, resellers,
  Key, InsertKey, keys, 
  Device, InsertDevice, devices,
  Game, keyStatusEnum, KeyStatus
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // Admin methods
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Token methods
  createToken(): Promise<Token>;
  getAllTokens(): Promise<Token[]>;
  getToken(token: string): Promise<Token | undefined>;
  useToken(token: string, username: string): Promise<Token | undefined>;
  
  // Reseller methods
  getReseller(id: number): Promise<Reseller | undefined>;
  getResellerByUsername(username: string): Promise<Reseller | undefined>;
  createReseller(reseller: InsertReseller): Promise<Reseller>;
  getAllResellers(): Promise<Reseller[]>;
  updateResellerCredits(id: number, amount: number): Promise<Reseller | undefined>;
  updateResellerStatus(id: number, isActive: boolean): Promise<Reseller | undefined>;
  
  // Key methods
  createKey(key: InsertKey): Promise<Key>;
  getKey(keyString: string): Promise<Key | undefined>;
  getKeysByResellerId(resellerId: number): Promise<Key[]>;
  getAllKeys(): Promise<Key[]>;
  revokeKey(keyId: number): Promise<Key | undefined>;
  
  // Device methods
  addDevice(device: InsertDevice): Promise<Device>;
  getDevicesByKeyId(keyId: number): Promise<Device[]>;
  removeDevice(deviceId: string, keyId: number): Promise<boolean>;
  
  // Stats
  getStats(): Promise<{
    totalResellers: number;
    activeKeys: number;
    availableTokens: number;
  }>;
}

export class MemStorage implements IStorage {
  private admins: Map<number, Admin>;
  private tokens: Map<number, Token>;
  private resellers: Map<number, Reseller>;
  private keys: Map<number, Key>;
  private devices: Map<number, Device>;
  
  private adminId: number = 1;
  private tokenId: number = 1;
  private resellerId: number = 1;
  private keyId: number = 1;
  private deviceId: number = 1;

  constructor() {
    this.admins = new Map();
    this.tokens = new Map();
    this.resellers = new Map();
    this.keys = new Map();
    this.devices = new Map();
    
    // Create default admin
    this.createAdmin({
      username: "admin",
      password: "admin123"
    });
  }

  // Admin methods
  async getAdmin(id: number): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.adminId++;
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }

  // Token methods
  async createToken(): Promise<Token> {
    const id = this.tokenId++;
    const tokenString = `REF-${nanoid(10).toUpperCase()}`;
    const token: Token = {
      id,
      token: tokenString,
      createdAt: new Date(),
      usedBy: null,
      isUsed: false
    };
    this.tokens.set(id, token);
    return token;
  }

  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async getToken(tokenString: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(
      (token) => token.token === tokenString
    );
  }

  async useToken(tokenString: string, username: string): Promise<Token | undefined> {
    const token = await this.getToken(tokenString);
    if (token && !token.isUsed) {
      const updatedToken: Token = {
        ...token,
        isUsed: true,
        usedBy: username
      };
      this.tokens.set(token.id, updatedToken);
      return updatedToken;
    }
    return undefined;
  }

  // Reseller methods
  async getReseller(id: number): Promise<Reseller | undefined> {
    return this.resellers.get(id);
  }

  async getResellerByUsername(username: string): Promise<Reseller | undefined> {
    return Array.from(this.resellers.values()).find(
      (reseller) => reseller.username === username
    );
  }

  async createReseller(insertReseller: InsertReseller): Promise<Reseller> {
    const id = this.resellerId++;
    const reseller: Reseller = {
      ...insertReseller,
      id,
      credits: 0,
      registrationDate: new Date(),
      isActive: true
    };
    this.resellers.set(id, reseller);
    return reseller;
  }

  async getAllResellers(): Promise<Reseller[]> {
    return Array.from(this.resellers.values());
  }

  async updateResellerCredits(id: number, amount: number): Promise<Reseller | undefined> {
    const reseller = await this.getReseller(id);
    if (reseller) {
      const updatedReseller: Reseller = {
        ...reseller,
        credits: reseller.credits + amount
      };
      this.resellers.set(id, updatedReseller);
      return updatedReseller;
    }
    return undefined;
  }

  async updateResellerStatus(id: number, isActive: boolean): Promise<Reseller | undefined> {
    const reseller = await this.getReseller(id);
    if (reseller) {
      const updatedReseller: Reseller = {
        ...reseller,
        isActive
      };
      this.resellers.set(id, updatedReseller);
      return updatedReseller;
    }
    return undefined;
  }

  // Key methods
  async createKey(insertKey: InsertKey): Promise<Key> {
    const id = this.keyId++;
    const key: Key = {
      ...insertKey,
      id,
      createdAt: new Date(),
      isRevoked: false
    };
    this.keys.set(id, key);
    return key;
  }

  async getKey(keyString: string): Promise<Key | undefined> {
    return Array.from(this.keys.values()).find(
      (key) => key.keyString === keyString
    );
  }

  async getKeysByResellerId(resellerId: number): Promise<Key[]> {
    return Array.from(this.keys.values()).filter(
      (key) => key.resellerId === resellerId
    );
  }

  async getAllKeys(): Promise<Key[]> {
    return Array.from(this.keys.values());
  }

  async revokeKey(keyId: number): Promise<Key | undefined> {
    const key = this.keys.get(keyId);
    if (key) {
      const updatedKey: Key = {
        ...key,
        isRevoked: true
      };
      this.keys.set(keyId, updatedKey);
      return updatedKey;
    }
    return undefined;
  }

  // Device methods
  async addDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.deviceId++;
    const device: Device = {
      ...insertDevice,
      id,
      firstConnected: new Date()
    };
    this.devices.set(id, device);
    return device;
  }

  async getDevicesByKeyId(keyId: number): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(
      (device) => device.keyId === keyId
    );
  }

  async removeDevice(deviceId: string, keyId: number): Promise<boolean> {
    const device = Array.from(this.devices.values()).find(
      (d) => d.deviceId === deviceId && d.keyId === keyId
    );
    
    if (device) {
      this.devices.delete(device.id);
      return true;
    }
    
    return false;
  }

  // Stats methods
  async getStats(): Promise<{ totalResellers: number; activeKeys: number; availableTokens: number; }> {
    const totalResellers = this.resellers.size;
    
    const now = new Date();
    const activeKeys = Array.from(this.keys.values()).filter(
      (key) => !key.isRevoked && new Date(key.expiryDate) > now
    ).length;
    
    const availableTokens = Array.from(this.tokens.values()).filter(
      (token) => !token.isUsed
    ).length;
    
    return {
      totalResellers,
      activeKeys,
      availableTokens
    };
  }
}

export const storage = new MemStorage();
