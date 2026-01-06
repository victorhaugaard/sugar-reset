import { Platform } from 'react-native';

// Types for better code navigation, but we won't import values statically
import type { HealthKitPermissions, HealthValue } from 'react-native-health';
import {
    ReadRecordsOptions, // Keep this if it's used for types elsewhere, though not in the provided snippet
} from 'react-native-health-connect';

export interface HealthData {
    steps?: number;
    sugarGrams?: number;
}

class HealthService {
    private isInitialized = false;
    private AppleHealthKit: any = null;
    private HealthConnect: any = null;

    constructor() {
        // Dynamically require modules if available, or just mock them
        if (Platform.OS === 'ios') {
            try {
                this.AppleHealthKit = require('react-native-health').default;
            } catch (e) {
                console.log('[HealthService] AppleHealthKit not found (Expo Go?)');
            }
        } else if (Platform.OS === 'android') {
            try {
                this.HealthConnect = require('react-native-health-connect');
            } catch (e) {
                console.log('[HealthService] HealthConnect not found (Expo Go?)');
            }
        }
    }

    async init(): Promise<boolean> {
        if (GlobalMockMode.isMock) return false; // Force fail to mock if needed, but logic below handles it

        if (Platform.OS === 'ios' && this.AppleHealthKit) {
            const PERMISSIONS = {
                permissions: {
                    read: [
                        this.AppleHealthKit.Constants?.Permissions?.SleepAnalysis,
                    ],
                    write: [],
                },
            } as HealthKitPermissions;

            return new Promise((resolve, reject) => {
                this.AppleHealthKit.initHealthKit(PERMISSIONS, (error: string) => {
                    if (error) {
                        console.warn('[HealthService] iOS Init Error:', error);
                        resolve(false);
                        return;
                    }
                    this.isInitialized = true;
                    resolve(true);
                });
            });
        } else if (Platform.OS === 'android' && this.HealthConnect) {
            try {
                const isInitialized = await this.HealthConnect.initialize();
                if (!isInitialized) {
                    // Health Connect not available
                    return false;
                }

                // Request permissions
                await this.HealthConnect.requestPermission([
                    { accessType: 'read', recordType: 'SleepSession' },
                ]);
                this.isInitialized = true;
                return true;
            } catch (error) {
                console.warn('[HealthService] Android Init Error:', error);
                return false;
            }
        }
        return false;
    }

    async getTodaySleep(): Promise<number> {
        // Mock Data Fallback for Expo Go (Dev Mode) or if Init fails
        // We check this FIRST if modules are missing so it doesn't try to init
        if (!this.AppleHealthKit && !this.HealthConnect) {
            if (__DEV__) {
                console.log('[HealthService] Native modules not found. Returning MOCK data.');
                await new Promise(resolve => setTimeout(resolve, 1000));
                return 7.5;
            }
            return 0;
        }

        if (!this.isInitialized) {
            const success = await this.init();
            if (!success) {
                if (__DEV__) {
                    console.log('[HealthService] Init failed. Returning MOCK data.');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return 7.5;
                }
                return 0;
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (Platform.OS === 'ios' && this.AppleHealthKit) {
            return new Promise((resolve) => {
                const options = {
                    startDate: today.toISOString(),
                    endDate: tomorrow.toISOString(),
                    limit: 10,
                };

                this.AppleHealthKit.getSleepSamples(
                    options,
                    (err: Object, results: Array<HealthValue>) => {
                        if (err) {
                            console.warn('[HealthService] iOS Get Sleep Error:', err);
                            resolve(0);
                            return;
                        }
                        const totalMinutes = results.reduce((sum, item) => {
                            const start = new Date(item.startDate).getTime();
                            const end = new Date(item.endDate).getTime();
                            return sum + ((end - start) / 1000 / 60);
                        }, 0);
                        resolve(totalMinutes / 60);
                    },
                );
            });
        } else if (Platform.OS === 'android' && this.HealthConnect) {
            try {
                const records = await this.HealthConnect.readRecords('SleepSession', {
                    timeRangeFilter: {
                        operator: 'between',
                        startTime: today.toISOString(),
                        endTime: tomorrow.toISOString(),
                    },
                });

                const totalMinutes = records.records.reduce((sum: any, record: any) => {
                    const start = new Date(record.startTime).getTime();
                    const end = new Date(record.endTime).getTime();
                    return sum + ((end - start) / 1000 / 60);
                }, 0);

                return totalMinutes / 60;
            } catch (error) {
                console.warn('Android readRecords error', error);
                if (__DEV__) return 7.5;
                return 0;
            }
        }

        // Fallback for Mock
        if (__DEV__) return 7.5;
        return 0;
    }
}

// Helper to disable mock mode logic if needed
const GlobalMockMode = { isMock: false };

export const healthService = new HealthService();
