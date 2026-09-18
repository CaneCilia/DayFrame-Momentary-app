import { Platform } from 'react-native';

// Helper to safely get Notifications module
const getNotificationsModule = async () => {
  // CRITICAL FIX: Even dynamic imports of `expo-notifications` crash Expo Go
  // due to `.fx.js` side-effect files throwing uncaught errors on evaluation.
  // To allow the app to run in Expo Go, we must completely mock this out.
  // When running a true EAS development build, you can restore the import:
  // return await import('expo-notifications');
  console.log('[Mock] Notifications module skipped to prevent Expo Go crash.');
  return null;
};

// Configure how notifications appear when app is in foreground
getNotificationsModule().then((Notifications) => {
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
});

export const requestNotificationPermissions = async () => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  return finalStatus === 'granted';
};

export const scheduleDailyReminder = async (hour: number, minute: number) => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  // Cancel existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for today's moment!",
      body: "Don't forget to capture your one photo for today.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

export const cancelAllReminders = async () => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
};
