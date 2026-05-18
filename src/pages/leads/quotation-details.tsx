import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/the-steel-logo-dark.svg";
export default function QuotationDetailsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          className="px-8"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          View Project Details
        </Button>
      </div>

      {/* Main Quotation Card */}
      <div className="bg-white rounded-lg shadow-sm w-full p-10 relative">
        {/* Status Badge */}
        <div className="absolute top-8 right-10">
          <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-500 text-sm font-medium">
            Converted To Project
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold tracking-widest text-gray-400">
            QUATATION
          </h1>
        </div>

        {/* Header Details */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            {/* Logo area */}
            <div className="flex items-center gap-2 mb-6">
              <img src={Logo} alt="The Steel Logo" className="w-32" />
            </div>

            <div className="text-sm text-gray-600 leading-relaxed font-medium">
              <p>1851 Madison Ave Suite 300</p>
              <p>Council Bluffs, IA</p>
              <p>51503</p>
              <p>United States</p>
              <p>travis@storagematerials.com</p>
              <p>www.storagematerials.com</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-16 pt-2">
            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              <span className="font-medium">Quotation #</span>
              <span className="text-right text-gray-800">2460</span>

              <span className="font-medium">Date</span>
              <span className="text-right text-gray-800">10-25-2025</span>

              <span className="font-medium">Business/Tax #</span>
              <span className="text-right text-gray-800">99- 4515145</span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="flex justify-between mb-3 text-sm font-bold text-gray-800 px-1">
          <span>ABC CORP</span>
          <span>Total</span>
        </div>
        <hr className="border-gray-300" />

        <div className="py-4 space-y-1">
          <div className="flex justify-between text-sm text-gray-600 font-medium px-1">
            <span>Building 1</span>
            <span>$75,00.000</span>
          </div>
          <div className="text-xs text-gray-400 px-1">3500 sq ft building</div>
        </div>
        <hr className="border-gray-300 mb-8" />

        {/* Image and Totals */}
        <div className="flex justify-between items-start gap-8 mb-16">
          <div className="w-1/2 aspect-4/3 bg-gray-100 rounded overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1541888086053-157dc16d4c1f?q=80&w=600&auto=format&fit=crop"
              alt="Building structure"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-1/2 mt-8">
            <div className="flex justify-between text-sm font-bold text-gray-800 mb-4 px-1">
              <span>Subtotal</span>
              <span>$1,917,952.00</span>
            </div>
            <hr className="border-gray-100 mb-4" />
            <div className="flex justify-between text-sm font-bold text-gray-800 px-1">
              <span>Total</span>
              <span>$2,071,388.16</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-300 mb-6" />

        <div className="text-sm text-gray-600 mb-6 px-1 font-medium">
          Thank you for your business? Reach out with any questions
        </div>

        <hr className="border-gray-300 mb-6" />

        <div className="text-sm text-gray-600 mb-20 px-1 font-medium">
          By Signing this document the customer agrees to the services and
          conditions outlined in this document
        </div>

        {/* Signature Box */}
        <div className="flex justify-end mt-24 mb-8 pr-12 text-sm text-gray-600">
          <div className="w-64">
            <hr className="border-gray-400 mb-3" />
            <p className="text-xs text-gray-500 font-medium">
              Client signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
