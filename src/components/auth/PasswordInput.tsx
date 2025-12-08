'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { useState } from "react";

export function PasswordInput() {
  const [password, setPassword] = useState("");

  const checkPasswordStrength = (pass: string) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /\d/.test(pass)
    };
  };

  const strength = checkPasswordStrength(password);
  const strengthLevel = Object.values(strength).filter(Boolean).length;

  console.log('Password:', password);
  console.log('Strength Level:', strengthLevel);
  console.log('Strength Object:', strength);

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="password">كلمة المرور</Label>
        <Input 
          id="password" 
          type="password" 
          name="password" 
          required 
          minLength={8}
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
          title="يجب أن تحتوي كلمة المرور على: حرف كبير، حرف صغير، ورقم، على الأقل 8 أحرف"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      {/* Four Rules in One Line */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${strength.length ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
          <span className={strength.length ? 'text-green-600' : ''}>8 أحرف</span>
          {strength.length && <Check className="w-3 h-3 text-green-500" />}
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${strength.uppercase ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
          <span className={strength.uppercase ? 'text-green-600' : ''}>حرف كبير</span>
          {strength.uppercase && <Check className="w-3 h-3 text-green-500" />}
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${strength.lowercase ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
          <span className={strength.lowercase ? 'text-green-600' : ''}>حرف صغير</span>
          {strength.lowercase && <Check className="w-3 h-3 text-green-500" />}
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${strength.number ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
          <span className={strength.number ? 'text-green-600' : ''}>رقم</span>
          {strength.number && <Check className="w-3 h-3 text-green-500" />}
        </div>
      </div>

      {/* Simple Strength Bar */}
      <div className="h-1 w-full rounded-full">
        <div 
          className="h-full transition-all duration-300"
          style={{ 
            width: `${password ? (strengthLevel / 4) * 100 : 0}%`,
            backgroundColor: strengthLevel === 0 ? 'transparent' :
                           strengthLevel === 1 ? '#ef4444' :
                           strengthLevel === 2 ? '#f97316' :
                           strengthLevel === 3 ? '#eab308' :
                           '#22c55e'
          }}
        />
      </div>
    </>
  );
}
