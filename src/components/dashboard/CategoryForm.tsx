'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Button } from '@/components/ui/button';
import { createCategory, updateCategory } from '@/app/actions/categories';
import { useToast } from '@/hooks/use-toast';
import type { CategoryWithSubcategories } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UpgradeAlert } from './UpgradeAlert';

const formSchema = z.object({
    name: z.string().min(2, 'يجب أن يكون الاسم حرفين على الأقل.').max(50),
    parent_category_id: z.coerce.number().nullable().optional(),
});

interface CategoryFormProps {
    catalogId: number;
    category?: CategoryWithSubcategories;
    categories: CategoryWithSubcategories[];
    defaultParentId?: number | null;
    hideParentSelection?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CategoryForm({ catalogId, category, categories, defaultParentId, hideParentSelection, onSuccess, onCancel }: CategoryFormProps) {
    const { toast } = useToast();
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
    const [submissionId, setSubmissionId] = useState<string>('');

    // Function to render categories with hierarchy for dropdown
    const renderCategoryOptions = (cats: CategoryWithSubcategories[], level = 0): JSX.Element[] => {
        const options: JSX.Element[] = [];

        cats.forEach((cat) => {
            if (cat.id !== category?.id) {
                const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(level);
                const prefix = level > 0 ? '└─ ' : '• ';

                options.push(
                    <SelectItem key={cat.id} value={String(cat.id)} className="cursor-pointer">
                        <span className="flex items-center">
                            <span className="text-muted-foreground/50 mr-1">{indent}</span>
                            <span className={level > 0 ? "text-muted-foreground" : "font-medium"}>
                                {prefix}{cat.name}
                            </span>
                        </span>
                    </SelectItem>
                );

                if (cat.subcategories && cat.subcategories.length > 0) {
                    options.push(...renderCategoryOptions(cat.subcategories, level + 1));
                }
            }
        });

        return options;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: category?.name || undefined,
            parent_category_id: category?.parent_category_id ?? null,
        },
    });

    const { setValue } = form;

    useEffect(() => {
        if (defaultParentId) {
            setValue('parent_category_id', defaultParentId);
        }
    }, [defaultParentId, setValue]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Prevent multiple submissions
        const isSubmitting = form.formState.isSubmitting;
        if (isSubmitting) {
            return;
        }

        // Create unique submission ID
        const currentSubmissionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        if (submissionId === currentSubmissionId) {
            return;
        }
        setSubmissionId(currentSubmissionId);

        try {
            const formData = new FormData();
            formData.append('catalog_id', String(catalogId));
            formData.append('name', values.name || '');

            const parentId = defaultParentId ?? values.parent_category_id;
            formData.append('parent_category_id', parentId === null || parentId === undefined ? '' : String(parentId));

            let result;
            if (category) {
                formData.append('id', String(category.id));
                result = await updateCategory({}, formData);
            } else {
                result = await createCategory({}, formData);
            }

            if (result && typeof result === 'object' && 'message' in result) {
                const message = (result as any).message;
                if (typeof message === 'string') {
                    if (message === 'LIMIT_REACHED') {
                        setShowUpgradeAlert(true);
                        return;
                    }

                    toast({
                        title: message.includes('فشل') || message.includes('خطأ') ? 'خطأ' : 'نجاح!',
                        description: message,
                        variant: message.includes('فشل') || message.includes('خطأ') ? 'destructive' : 'default',
                    });

                    if (!message.includes('فشل') && !message.includes('خطأ')) {
                        form.reset();
                        console.log('onSuccess called in CategoryForm');
                        // Introduce a small delay to allow revalidatePath to complete
                        setTimeout(() => {
                          onSuccess?.();
                        }, 100);
                    }
                }
            } else {
                toast({
                    title: 'خطأ',
                    description: 'حدث خطأ غير متوقع في الاستجابة.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error in onSubmit:', error);
            toast({
                title: 'خطأ',
                description: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
                variant: 'destructive',
            });
        }
    };

    return (
        <>
            <UpgradeAlert
                open={showUpgradeAlert}
                onOpenChange={setShowUpgradeAlert}
                resourceType="category"
            />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base font-semibold flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-primary" />
                                    اسم التصنيف
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            className="h-11 bg-muted/30 focus:bg-background transition-colors"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {!hideParentSelection && !defaultParentId && (
                        <FormField
                            control={form.control}
                            name="parent_category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-primary" />
                                        التصنيف الأم (اختياري)
                                    </FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === 'none' ? null : Number(value))}
                                        value={field.value === null || field.value === undefined ? 'none' : String(field.value)}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11 bg-muted/30 focus:bg-background transition-colors">
                                                <SelectValue placeholder="اختر تصنيف أم" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none" className="font-medium text-muted-foreground">
                                                لا يوجد تصنيف أم (تصنيف رئيسي)
                                            </SelectItem>
                                            {renderCategoryOptions(categories)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="pt-2 flex gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onCancel}
                            className="w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all"
                        >
                            إلغاء
                        </Button>
                        <SubmitButton
                            pendingText={category ? 'جاري التحديث...' : 'جاري الحفظ...'}
                            className="w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all"
                        >
                            {category ? 'حفظ التغييرات' : 'حفظ التصنيف'}
                        </SubmitButton>
                    </div>
                    <div className="h-24" /> {/* مسافة إضافية أسفل الزر لتجنب التداخل مع شريط التنقل */}
                </form>
            </Form>
        </>
    );
}
