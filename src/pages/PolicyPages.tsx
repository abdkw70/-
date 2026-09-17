import React from 'react';
import { ShieldCheck, RotateCcw, Truck, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PolicyPageProps {
  type: 'refund' | 'privacy' | 'terms' | 'shipping';
  onNavigate: (path: string) => void;
}

export const PolicyPages: React.FC<PolicyPageProps> = ({ type, onNavigate }) => {
  const { dir, isRtl, t, storeName } = useLanguage();

  const getPolicyContent = () => {
    switch (type) {
      case 'refund':
        return {
          title: isRtl ? 'سياسة الاسترجاع والاستبدال' : 'Refund & Exchange Policy',
          icon: <RotateCcw className="w-8 h-8 text-amber-600" />,
          content: isRtl
            ? [
                {
                  heading: 'شروط الاسترجاع والاستبدال',
                  text: 'يحق لعملاء مكتبة الشاطئ الازرق طلب استرجاع أو استبدال المنتجات خلال 14 يوماً من تاريخ استلام الطلب، شريطة أن تكون المنتجات بحالتها الأصلية غير مستخدمة ومغلفة بغلافها الأصلي المصنعي مع وجود الفاتورة.',
                },
                {
                  heading: 'المنتجات المستثناة',
                  text: 'تستثنى من سياسة الاسترجاع المنتجات التي تم تخصيصها أو طباعتها حسب طلب العميل، أو الأدوات التي تم فتح عبوتها وتجربتها كالألوان المفتوحة بعد الاستخدام.',
                },
                {
                  heading: 'طريقة استرداد المبالغ',
                  text: 'يتم استرداد المبلغ نقداً عند استرجاع واستلام المنتجات من العميل، أو عبر التحويل البنكي المباشر خلال 3 إلى 5 أيام عمل بعد فحص المنتجات المسترجعة في مستودعاتنا.',
                },
              ]
            : [
                {
                  heading: 'Return & Exchange Conditions',
                  text: 'Customers of Blue Beach Stationery may request a return or exchange within 14 days from delivery, provided items are unused, in original factory packaging, and accompanied by the invoice.',
                },
                {
                  heading: 'Excluded Products',
                  text: 'Custom-printed products or items that have been unsealed and tested (such as opened markers or paints) are excluded from returns.',
                },
                {
                  heading: 'Refund Methods',
                  text: 'Refunds are processed in cash upon item collection or via direct bank transfer within 3 to 5 business days after inspection at our warehouse.',
                },
              ],
        };
      case 'privacy':
        return {
          title: isRtl ? 'سياسة الخصوصية وأمان البيانات' : 'Privacy & Data Security Policy',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
          content: isRtl
            ? [
                {
                  heading: 'حماية بيانات العملاء',
                  text: 'نلتزم في مكتبة الشاطئ الازرق بأعلى معايير حماية الخصوصية والأمان. لا يتم مشاركة أو بيع أي بيانات شخصية (مثل الاسم، العنوان، رقم الهاتف، أو البريد الإلكتروني) لأي طرف ثالث خارج نطاق إتمام التوصيل.',
                },
                {
                  heading: 'أمان الطلبات والدفع',
                  text: 'نعتمد طريقة الدفع عند الاستلام (كاش) والطلب المباشر عبر الواتساب الموثق لتوفير أقصى درجات الأمان والراحة لعملائنا في دولة الكويت.',
                },
              ]
            : [
                {
                  heading: 'Customer Data Protection',
                  text: 'We at Blue Beach Stationery strictly adhere to the highest privacy and security standards. Personal data (such as name, address, phone number, or email) is never shared or sold to third parties outside of delivery fulfillment.',
                },
                {
                  heading: 'Order & Payment Safety',
                  text: 'We offer Cash on Delivery (COD) and direct WhatsApp orders to provide maximum security, transparency, and convenience for all customers in Kuwait.',
                },
              ],
        };
      case 'shipping':
        return {
          title: isRtl ? 'سياسة الشحن والتوصيل' : 'Shipping & Delivery Policy',
          icon: <Truck className="w-8 h-8 text-sky-600" />,
          content: isRtl
            ? [
                {
                  heading: 'نطاق التغطية ومناطق الكويت',
                  text: 'نوفر خدمة التوصيل السريع لجميع مناطق ومحافظات دولة الكويت (العاصمة، حولي، الفروانية، الأحمدي، مبارك الكبير، والجهراء).',
                },
                {
                  heading: 'مدة التوصيل',
                  text: 'يتم توصيل الطلبات خلال 24 إلى 48 ساعة كحد أقصى من تأكيد الطلب. يقوم مندوب التوصيل بالاتصال أو إرسال رسالة واتساب قبل الوصول.',
                },
                {
                  heading: 'رسوم الشحن والتوصيل المجاني',
                  text: 'رسوم التوصيل القياسية لكافة مناطق الكويت هي 1.500 د.ك، وتكون مجانية تماماً للطلبات التي تتجاوز قيمتها 20.000 د.ك.',
                },
              ]
            : [
                {
                  heading: 'Coverage Across Kuwait',
                  text: 'We provide fast express delivery across all Kuwait governorates (Capital, Hawalli, Farwaniya, Ahmadi, Mubarak Al-Kabeer, and Jahra).',
                },
                {
                  heading: 'Delivery Timeframe',
                  text: 'Orders are delivered within 24 to 48 hours from confirmation. Our delivery courier will call or message via WhatsApp prior to arrival.',
                },
                {
                  heading: 'Shipping Rates & Free Delivery',
                  text: 'Standard delivery across Kuwait is 1.500 KWD, and completely free for orders exceeding 20.000 KWD.',
                },
              ],
        };
      case 'terms':
      default:
        return {
          title: isRtl ? 'الشروط والأحكام العامة' : 'Terms & Conditions',
          icon: <FileText className="w-8 h-8 text-indigo-600" />,
          content: isRtl
            ? [
                {
                  heading: 'أصالة المنتجات والأسعار',
                  text: 'جميع المنتجات المعروضة في مكتبة الشاطئ الازرق (BLUE BEACH STATIONERY) هي منتجات أصلية وبأسعار رسمية بالدينار الكويتي (KWD). نحتفظ بحق تعديل الأسعار أو تصحيح أي خطأ غير مقصود.',
                },
                {
                  heading: 'تأكيد الطلبات',
                  text: 'يعد استلام العميل لرسالة تأكيد الطلب إقراراً بصحة البيانات المدخلة وموافقته على شروط التوصيل والدفع.',
                },
              ]
            : [
                {
                  heading: 'Product Authenticity & Pricing',
                  text: 'All items displayed on Blue Beach Stationery are genuine products with official pricing in Kuwaiti Dinars (KWD). We reserve the right to correct typographical pricing errors.',
                },
                {
                  heading: 'Order Confirmation',
                  text: 'Receipt of order confirmation signifies that customer details are accurate and that the customer accepts delivery and payment terms.',
                },
              ],
        };
    }
  };

  const policy = getPolicyContent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8" dir={dir}>
      <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          {policy.icon}
        </div>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold text-slate-900">{policy.title}</h1>
          <p className="text-xs text-slate-500 mt-1">{storeName}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        {policy.content.map((item, idx) => (
          <div key={idx} className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h2 className="text-sm font-bold text-slate-900">{item.heading}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{item.text}</p>
          </div>
        ))}

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {isRtl ? 'لأي استفسار إضافي، تواصل مع فريق الدعم' : 'For any further questions, please contact our support'}
          </span>
          <button
            onClick={() => onNavigate('/')}
            className="bg-sky-700 hover:bg-sky-800 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            {t('nav.home')}
          </button>
        </div>
      </div>
    </div>
  );
};
