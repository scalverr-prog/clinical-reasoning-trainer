import type { CategoryProgress, CompletedCase, CaseWithCategory, Category, SuggestedCase, Certification, License, CEURecord } from '../types';

// App notification interface for in-app notifications
export interface AppNotification {
  id: string;
  type: 'license_expiring' | 'certification_expiring' | 'ceu_expiring' | 'conference_reminder' | 'achievement' | 'info';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

class NotificationServiceClass {
  private static instance: NotificationServiceClass;
  private lastNotificationCheck: string | null = null;

  static getInstance(): NotificationServiceClass {
    if (!this.instance) {
      this.instance = new NotificationServiceClass();
    }
    return this.instance;
  }

  // Check if browser notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Browser does not support notifications');
    }
    return Notification.requestPermission();
  }

  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  showNotification(
    title: string,
    body: string,
    options?: NotificationOptions & { onClick?: () => void }
  ): Notification | null {
    if (Notification.permission !== 'granted') {
      return null;
    }

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      ...options,
    });

    if (options?.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    return notification;
  }

  // Generate notifications from expiring credentials
  generateExpirationNotifications(
    certifications: Certification[],
    licenses: License[],
    ceus: CEURecord[]
  ): AppNotification[] {
    const notifications: AppNotification[] = [];
    const now = new Date();

    // Check certifications
    certifications.forEach((cert) => {
      const expDate = new Date(cert.expirationDate);
      const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 90 && daysUntil > 0) {
        notifications.push({
          id: `cert-exp-${cert.id}`,
          type: 'certification_expiring',
          title: `${cert.name} Expiring`,
          message: daysUntil <= 7
            ? `Expires in ${daysUntil} day${daysUntil === 1 ? '' : 's'}! Renew immediately.`
            : daysUntil <= 30
            ? `Expires in ${daysUntil} days. Schedule your renewal.`
            : `Expires in ${Math.floor(daysUntil / 30)} month${Math.floor(daysUntil / 30) === 1 ? '' : 's'}. Plan ahead.`,
          link: 'credentials',
          read: false,
          createdAt: new Date().toISOString(),
          urgency: daysUntil <= 7 ? 'critical' : daysUntil <= 30 ? 'high' : daysUntil <= 60 ? 'medium' : 'low',
        });
      } else if (daysUntil <= 0) {
        notifications.push({
          id: `cert-expired-${cert.id}`,
          type: 'certification_expiring',
          title: `${cert.name} EXPIRED`,
          message: `This certification expired ${Math.abs(daysUntil)} days ago. Renew immediately.`,
          link: 'credentials',
          read: false,
          createdAt: new Date().toISOString(),
          urgency: 'critical',
        });
      }
    });

    // Check licenses
    licenses.forEach((license) => {
      const expDate = new Date(license.expirationDate);
      const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 90 && daysUntil > 0) {
        notifications.push({
          id: `lic-exp-${license.id}`,
          type: 'license_expiring',
          title: `${license.type} License (${license.state}) Expiring`,
          message: daysUntil <= 7
            ? `Expires in ${daysUntil} day${daysUntil === 1 ? '' : 's'}! Renew immediately.`
            : daysUntil <= 30
            ? `Expires in ${daysUntil} days. Start your renewal process.`
            : `Expires in ${Math.floor(daysUntil / 30)} month${Math.floor(daysUntil / 30) === 1 ? '' : 's'}.`,
          link: 'credentials',
          read: false,
          createdAt: new Date().toISOString(),
          urgency: daysUntil <= 7 ? 'critical' : daysUntil <= 30 ? 'high' : daysUntil <= 60 ? 'medium' : 'low',
        });
      } else if (daysUntil <= 0) {
        notifications.push({
          id: `lic-expired-${license.id}`,
          type: 'license_expiring',
          title: `${license.type} License (${license.state}) EXPIRED`,
          message: `This license expired ${Math.abs(daysUntil)} days ago. Renew immediately.`,
          link: 'credentials',
          read: false,
          createdAt: new Date().toISOString(),
          urgency: 'critical',
        });
      }
    });

    // Check CEUs with expiration dates
    ceus.forEach((ceu) => {
      if (!ceu.expirationDate) return;

      const expDate = new Date(ceu.expirationDate);
      const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 30 && daysUntil > 0) {
        notifications.push({
          id: `ceu-exp-${ceu.id}`,
          type: 'ceu_expiring',
          title: `CEU Expiring: ${ceu.title}`,
          message: `This CEU credit expires in ${daysUntil} days.`,
          link: 'credentials',
          read: false,
          createdAt: new Date().toISOString(),
          urgency: daysUntil <= 7 ? 'high' : 'medium',
        });
      }
    });

    // Sort by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    notifications.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return notifications;
  }

  // Show browser notifications for critical/high urgency items
  showCredentialAlerts(notifications: AppNotification[]): void {
    const urgentItems = notifications.filter(n => n.urgency === 'critical' || n.urgency === 'high');

    if (urgentItems.length === 0) return;
    if (Notification.permission !== 'granted') return;

    // Only show once per session (check localStorage)
    const today = new Date().toDateString();
    if (this.lastNotificationCheck === today) return;
    this.lastNotificationCheck = today;

    // Show a single summary notification if multiple items
    if (urgentItems.length > 1) {
      this.showNotification('Credentials Need Attention',
        `${urgentItems.length} items are expiring soon or have expired. Check your Clinical Vault.`,
        { tag: 'credentials-summary', requireInteraction: true }
      );
    } else {
      const item = urgentItems[0];
      this.showNotification(item.title, item.message, {
        tag: item.id,
        requireInteraction: item.urgency === 'critical',
      });
    }
  }

  // Check if we should show login notification prompt
  shouldPromptForPermission(): boolean {
    if (!this.isSupported()) return false;
    if (Notification.permission === 'granted') return false;
    if (Notification.permission === 'denied') return false;

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Ask again after 7 days
      if (daysSinceDismissed < 7) return false;
    }

    return true;
  }

  // Mark notification prompt as dismissed
  dismissPermissionPrompt(): void {
    localStorage.setItem('notification-prompt-dismissed', new Date().toISOString());
  }

  showCaseReminder(suggestedCase: SuggestedCase): Notification | null {
    const reasonText = {
      weak_category: `Practice ${suggestedCase.category} (your weakest area)`,
      spaced_repetition: `Review due - last seen ${suggestedCase.daysSinceLastAttempt} days ago`,
      new_category: `Try a new category: ${suggestedCase.category}`,
      random: `Random practice session`,
    };

    return this.showNotification(
      'Time to Practice!',
      reasonText[suggestedCase.reason],
      {
        tag: 'case-reminder',
        requireInteraction: true,
      }
    );
  }

  getSuggestedCase(
    categoryProgress: Record<string, CategoryProgress>,
    completedCases: CompletedCase[],
    allCases: CaseWithCategory[]
  ): SuggestedCase | null {
    // Find weakest category
    const weakestCategory = this.findWeakestCategory(categoryProgress);

    if (!weakestCategory) {
      // No progress yet - suggest a random case
      if (allCases.length > 0) {
        const randomCase = allCases[Math.floor(Math.random() * allCases.length)];
        return {
          mrn: randomCase.mrn,
          reason: 'random',
          category: randomCase.categories[0] as Category || 'Emergency',
        };
      }
      return null;
    }

    // Find case for review
    const suggestedMrn = this.findCaseForReview(
      weakestCategory,
      completedCases,
      allCases
    );

    if (!suggestedMrn) return null;

    const lastAttempt = completedCases
      .filter((c) => c.mrn === suggestedMrn)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const daysSinceLastAttempt = lastAttempt
      ? Math.floor(
          (Date.now() - new Date(lastAttempt.date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : undefined;

    return {
      mrn: suggestedMrn,
      reason: daysSinceLastAttempt ? 'spaced_repetition' : 'weak_category',
      category: weakestCategory as Category,
      daysSinceLastAttempt,
      categoryScore: categoryProgress[weakestCategory]?.avgScore,
    };
  }

  private findWeakestCategory(
    progress: Record<string, CategoryProgress>
  ): string | null {
    const entries = Object.entries(progress);
    if (entries.length === 0) return null;

    let weakest = '';
    let lowestScore = 101;

    for (const [category, data] of entries) {
      if (data.avgScore < lowestScore) {
        lowestScore = data.avgScore;
        weakest = category;
      }
    }

    return weakest || null;
  }

  private findCaseForReview(
    category: string,
    completed: CompletedCase[],
    all: CaseWithCategory[]
  ): string | null {
    const categoryMrns = new Set(
      completed.filter((c) => c.category === category).map((c) => c.mrn)
    );
    const allInCategory = all.filter((c) =>
      c.categories.includes(category as Category)
    );

    // Find uncompleted case first
    const uncompleted = allInCategory.find((c) => !categoryMrns.has(c.mrn));
    if (uncompleted) return uncompleted.mrn;

    // Otherwise return oldest completed for re-review
    const oldest = completed
      .filter((c) => c.category === category)
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0];

    return oldest?.mrn || null;
  }
}

export const NotificationService = NotificationServiceClass.getInstance();
