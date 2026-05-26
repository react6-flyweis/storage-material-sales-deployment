import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router";

// Mock data - replace with actual API call
const contractData = {
  id: "1",
  title: "STORAGE MATERIALS",
  company: "Steel Investments, LLC",
  address: "1851 Madison Ave. Suite 300, Council Bluffs, Iowa 51503",
  sections: [
    {
      title: "1. Key Definitions",
      items: [
        {
          term: "Seller",
          definition:
            "Steel Investments [DBA Storage Materials], 1851 Madison Ave. Suite 300, Council Bluffs, IA 51503.",
        },
        {
          term: "Seller Group",
          definition:
            "Includes the Seller, its parent, subsidiary, and affiliated companies, subcontractors, and related personnel such as officers, employees, agents, contractors, and representatives.",
        },
        {
          term: "Buyer",
          definition:
            "The person or entity signing this contract to purchase materials.",
        },
        {
          term: "Buyer Group",
          definition:
            "Includes the Buyer, any party with an ownership interest in the building, and their related companies, personnel, and contractors.",
        },
        {
          term: "Building",
          definition:
            "The custom-designed metal building(s) specified in this contract.",
        },
        {
          term: "Contract",
          definition:
            "This agreement to design, fabricate, and deliver building materials.",
        },
        {
          term: "Drawings",
          definition:
            "Approval drawings, construction drawings, anchor bolt plans, design calculations, and specifications provided by Seller.",
        },
        {
          term: "Scheduling Notice",
          definition:
            "Written notice with estimated fabrication and shipping dates.",
        },
        {
          term: "Additional Fees",
          definition:
            "Includes taxes, insurance, freight, storage, permits, bonds, and approved change orders.",
        },
      ],
    },
    {
      title: "2. Price and Fees",
      items: [
        {
          definition:
            "The total price is listed in the acceptance section of the contract.",
        },
        {
          definition:
            "Additional fees are not included unless explicitly listed, such as taxes, freight, storage, Buyer must either arrange or pay for additional items they request.",
        },
        {
          definition: "Prices remain valid for 14 days from the quote issued.",
        },
      ],
    },
    {
      title: "3. Taxes",
      items: [
        {
          definition: "Buyer is responsible for all applicable taxes.",
        },
        {
          definition:
            "Buyer must provide a valid resale certificate before Final Payment.",
        },
        {
          definition: "Overpayments will be refunded by Seller.",
        },
      ],
    },
    {
      title: "4. Payment Terms",
      items: [
        {
          definition:
            "Deposits are required with contract execution; 50 percent or 30 percent without direct or withholding.",
        },
        {
          definition:
            "Late payments may incur interest at 1% per month (18% annually) or legal max, whichever is higher, in addition to attorney fees if Buyer is in default when a claim is initiated or a lien is placed.",
        },
        {
          definition:
            "Late payments incur interest at 2% per month (24% APR or state's legal max).",
        },
        {
          definition:
            "If deposit payment is not received, the contract is cancelled automatically.",
        },
        {
          definition:
            "Buyer is responsible for all collection costs, including attorney fees.",
        },
        {
          definition:
            "If work must be suspended due to non-payment or Buyer instructions, storage fees, demurrage, and other costs apply, which must be paid before resuming.",
        },
        {
          definition: "No refunds or withholding is permitted.",
        },
        {
          definition:
            "If Buyer or Buyer's agent fails to pay Seller, COD money was transfer 2 business days before building can ship if not applicable apply after signature.",
        },
      ],
    },
    {
      title: "5. Price Adjustments",
      items: [
        {
          definition:
            "Increases in raw material costs and approved change orders, if exceeding reasonable amount, Seller may require the project be rebid before fabrication or claim an extension of time.",
        },
        {
          definition: "Freight prices are subject to change.",
        },
      ],
    },
    {
      title: "6. Fabrication and Delivery",
      items: [
        {
          definition:
            "Delivery is FOB Seller's facility. Buyer is responsible for transportation costs.",
        },
        {
          definition:
            "Site transfers to Buyer after full payment, risk of loss transfers when materials are loaded onto the truck.",
        },
        {
          definition:
            "Partial shipments are permitted if total price is allocated.",
        },
        {
          definition:
            "Delivery dates are estimates; Seller is not liable for delays caused by suppliers, transportation, pandemic, events, etc.",
        },
        {
          definition:
            "Shipments may be delayed for more than 30 days without additional fees and potential credit charges.",
        },
      ],
    },
    {
      title: "7. Building Warranty",
      items: [
        {
          definition:
            "The Limited warranty excludes items not directly specified from Seller.",
        },
        {
          definition:
            "Materials or equipment purchased from third-parties are under the manufacturer's warranty.",
        },
        {
          definition:
            "Excess set to required Seller specifications or testing within one year. Seller will either provide replacement materials or refund warranty cost.",
        },
        {
          definition:
            "Warranty claims must be submitted in writing within one year. Seller will either provide a replacement or credit.",
        },
        {
          definition:
            "Installation warranty does not include delivery costs, erection costs, Buyer is responsible for installation by qualified contractors or licensed erectors.",
        },
        {
          definition:
            "Seller is not responsible for roof failure, soil, weather damage, or any failure of third-party products.",
        },
        {
          definition:
            "Damages or modifications by Buyer will forfeit the warranty. Buyer assumes all risk at delivery.",
        },
      ],
    },
    {
      title: "8. Design Warranty",
      items: [
        {
          definition:
            "Seller provides professional structural industry practices and comply with specified codes.",
        },
        {
          definition:
            "Excludes design for foundations, local building requirements, or manufacturer's liability if codes are not 37 years old or state allowed.",
        },
        {
          definition:
            "Seller provides construction drawings needed for erection but does not control or warrant the erection process.",
        },
        {
          definition:
            "Foundation drawings are provided as an example only. Buyer must obtain structural engineer review to ensure work is accurate.",
        },
      ],
    },
    {
      title: "9. Drawings and Revisions",
      items: [
        {
          definition:
            "Any errors in drawings to be returned to Seller for corrections and TIMBER revisions be one year from contract.",
        },
        {
          definition: "Seller can issue revisions if there is material cost.",
        },
        {
          definition:
            "Changes or substitutions by buyer will be paid or inciden or hidden quality and must be approved through the drawing process.",
        },
      ],
    },
    {
      title: "10. Change Orders",
      items: [
        {
          definition: "Any changes requested or agreed to in writing.",
        },
        {
          definition:
            "Seller can issue a formal Change Order with new associated price adjustments.",
        },
        {
          definition: "The design and building work cannot be altered.",
        },
      ],
    },
    {
      title: "11. Shortages or Damage",
      items: [
        {
          definition:
            "Purchaser is responsible for inspecting and recording within 7 Days of delivery.",
        },
        {
          definition:
            "Failure to do so prevents the claim for damage other damage to the jobsite.",
        },
      ],
    },
    {
      title: "12. Cancellation",
      items: [
        {
          definition:
            "Seller may cancel project at contractual cost meet any engineering, design, and preparation costs incurred.",
        },
        {
          definition:
            "Other liquidated penalties: Buyer is responsible for 50 percent of contract balance.",
        },
        {
          definition:
            "Seller may terminate the contract if Buyer fails to pay, breaches terms, or becomes insolvent.",
        },
      ],
    },
    {
      title: "13. Force Majeure",
      items: [
        {
          definition:
            "Seller is not liable for delays or failures caused by events beyond its control, including weather, labor disputes, shortages, transportation failures, pandemic, etc.",
        },
        {
          definition:
            "Any significant issue must be filed in Representative County, Iowa. Buyer agrees to jurisdiction and venue in Representative County, Iowa.",
        },
      ],
    },
    {
      title: "14. Limitation of Liability",
      items: [
        {
          definition:
            "Seller is not liable for consequential, incidental, or punitive damages, including lost profits or business interruption.",
        },
        {
          definition:
            "Seller's total liability for direct claims of loss or any products not party to Buyer, including lost profits or business interruption.",
        },
        {
          definition:
            "Seller's total liability is limited to the amount of the purchase price paid by Buyer.",
        },
      ],
    },
    {
      title: "15. Indemnification",
      items: [
        {
          definition:
            "Buyer agrees to indemnify and hold Seller harmless from any claims, damages, or losses arising from Buyer's use, installation, or maintenance of the Building, or for actions taken on or in property to the use, installation, or maintenance of the Building, or for actions on site or in property arising out of acts by Buyer or Buyer Group.",
        },
      ],
    },
    {
      title: "16. Governing Law and Venue",
      items: [
        {
          definition: "This Contract is governed by Iowa law.",
        },
        {
          definition:
            "Any legal action must be filed in Representative County, Iowa. Buyer agrees to jurisdiction and venue in Representative County, Iowa.",
        },
      ],
    },
    {
      title: "17. Entire Agreement",
      items: [
        {
          definition:
            "This Contract and the drawings constitute the entire agreement between Buyer and Seller.",
        },
        {
          definition:
            "If anything where is any conflict within a correspondence that is superseded by this contract.",
        },
      ],
    },
  ],
};

export default function ContractDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleDownload = () => {
    // Implement PDF download logic here
    console.log("Downloading contract:", id);
  };

  return (
    <div className="p-5">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigate(-1)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download Contract
          </Button>
        </div>
      </div>

      {/* Contract Content */}
      <Card className="">
        <CardContent className="p-6 md:p-12 bg-white">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">
              <span className="text-gray-900">STORAGE </span>
              <span className="bg-blue-600 text-white px-4 py-1">
                MATERIALS
              </span>
            </h1>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold text-lg">{contractData.company}</p>
              <p className="text-sm">{contractData.address}</p>
            </div>
          </div>

          {/* Contract Sections */}
          <div className="space-y-8">
            {contractData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <div className="space-y-3 text-gray-700">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="leading-relaxed text-sm">
                      {/* {item.term && (
                        <span className="font-semibold">• {item.term} – </span>
                      )}
                      {!item.term && <span className="font-semibold">• </span>} */}
                      <span>{item.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Signature Section */}
            <div className="mt-12 pt-8 border-t-2 space-y-8">
              <p className="text-sm text-gray-700 italic">
                • Any modifications should be in writing and signed by both
                parties.
              </p>

              <div className="text-center font-bold text-gray-900 mb-8">
                Signatures
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Seller Section */}
                <div className="space-y-4">
                  <div className="font-bold text-gray-900">
                    Seller: Steel Investments (DBA Storage Materials)
                  </div>
                  <div className="space-y-3">
                    <div className="border-b border-gray-400 pb-1">
                      <div className="text-xs text-gray-500 mb-1">
                        Signature:
                      </div>
                    </div>
                    <div className="border-b border-gray-400 pb-1">
                      <div className="text-xs text-gray-500 mb-1">
                        Printed Name:
                      </div>
                    </div>
                    <div className="border-b border-gray-400 pb-1">
                      <div className="text-xs text-gray-500 mb-1">Date:</div>
                    </div>
                  </div>
                </div>

                {/* Buyer Section */}
                <div className="space-y-4">
                  <div className="font-bold text-gray-900">Buyer:</div>
                  <div className="space-y-3">
                    <div className="border-b border-gray-400 pb-1">
                      <div className="text-xs text-gray-500 mb-1">
                        Signature:
                      </div>
                    </div>
                    <div className="border-b border-gray-400 pb-1">
                      <div className="text-xs text-gray-500 mb-1">
                        Printed Name:
                      </div>
                    </div>
                    <div className="border-b border-gray-400 pb-1">
                      <div className="text-xs text-gray-500 mb-1">Date:</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
