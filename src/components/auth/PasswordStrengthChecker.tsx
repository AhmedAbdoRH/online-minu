'use client';

import { Check } from "lucide-react";

export function PasswordStrengthChecker() {
  const checkPasswordStrength = (password: string) => {
    const rules = document.querySelectorAll('.password-rule');
    rules.forEach((rule, index) => {
      const check = rule.querySelector('.check-icon');
      if (check) {
        let isValid = false;
        switch(index) {
          case 0: isValid = password.length >= 8; break;
          case 1: isValid = /[A-Z]/.test(password); break;
          case 2: isValid = /[a-z]/.test(password); break;
          case 3: isValid = /\d/.test(password); break;
        }
        if (isValid) {
          check.classList.remove('hidden');
        } else {
          check.classList.add('hidden');
        }
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
      <div className="password-rule flex items-center gap-1">
        <Check className="check-icon hidden w-3 h-3 text-green-500" />
        <span>8 أحرف</span>
      </div>
      <div className="password-rule flex items-center gap-1">
        <Check className="check-icon hidden w-3 h-3 text-green-500" />
        <span>حرف كبير</span>
      </div>
      <div className="password-rule flex items-center gap-1">
        <Check className="check-icon hidden w-3 h-3 text-green-500" />
        <span>حرف صغير</span>
      </div>
      <div className="password-rule flex items-center gap-1">
        <Check className="check-icon hidden w-3 h-3 text-green-500" />
        <span>رقم</span>
      </div>
    </div>
  );
}
