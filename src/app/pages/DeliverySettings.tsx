import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";

export default function DeliverySettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    deliveryRadius: "5",
    deliveryCharge: "40",
    freeDeliveryAbove: "500",
    selfDelivery: false,
    pickupOption: true,
    maxDeliveryDistance: "10",
  });

  const handleSave = () => {
    toast.success("Delivery settings updated!");
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-b-[40px] p-6 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Delivery Settings</h1>
        <p className="text-white/90">Configure delivery options</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Delivery Radius */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Delivery Area</h3>
          
          <div className="mb-4">
            <Label htmlFor="radius" className="text-gray-800 font-medium">Delivery Radius (km)</Label>
            <Input
              id="radius"
              type="number"
              value={settings.deliveryRadius}
              onChange={(e) =>
                setSettings({ ...settings, deliveryRadius: e.target.value })
              }
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-2">
              Customers within this radius can place orders
            </p>
          </div>

          <div>
            <Label htmlFor="maxDistance" className="text-gray-800 font-medium">Maximum Distance (km)</Label>
            <Input
              id="maxDistance"
              type="number"
              value={settings.maxDeliveryDistance}
              onChange={(e) =>
                setSettings({ ...settings, maxDeliveryDistance: e.target.value })
              }
              className="mt-1"
            />
          </div>
        </div>

        {/* Delivery Charges */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Delivery Charges</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="deliveryCharge" className="text-gray-800 font-medium">
                Standard Delivery Charge (₹)
              </Label>
              <Input
                id="deliveryCharge"
                type="number"
                value={settings.deliveryCharge}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryCharge: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="freeDelivery" className="text-gray-800 font-medium">
                Free Delivery Above (₹)
              </Label>
              <Input
                id="freeDelivery"
                type="number"
                value={settings.freeDeliveryAbove}
                onChange={(e) =>
                  setSettings({ ...settings, freeDeliveryAbove: e.target.value })
                }
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-2">
                Orders above this amount get free delivery
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              💡 Offering free delivery on higher order values can increase average order size
            </p>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 mb-2">Delivery Options</h3>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Self Delivery</p>
              <p className="text-sm text-gray-500">Deliver orders yourself</p>
            </div>
            <Switch
              checked={settings.selfDelivery}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, selfDelivery: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">Pickup Option</p>
              <p className="text-sm text-gray-500">Allow customer pickup</p>
            </div>
            <Switch
              checked={settings.pickupOption}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, pickupOption: checked })
              }
            />
          </div>

          {!settings.selfDelivery && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-800">
                🚚 Platform delivery partners will handle your orders
              </p>
            </div>
          )}
        </div>

        {/* Delivery Time Slots (Future Enhancement) */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2">Delivery Hours</h3>
          <p className="text-sm text-gray-500 mb-4">
            Set your available delivery time slots
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Lunch</p>
                <p className="text-sm text-gray-500">11:00 AM - 3:00 PM</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Dinner</p>
                <p className="text-sm text-gray-500">6:00 PM - 10:00 PM</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Map Preview Placeholder */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3">Delivery Coverage</h3>
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl mb-2">🗺️</p>
              <p className="text-gray-600 text-sm">
                {settings.deliveryRadius}km radius from your location
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 z-50">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleSave}
            className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-lg font-medium"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
