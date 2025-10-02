'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getStages, Stage } from '@/lib/stages-service';
import { useVenture } from '@/contexts/VentureContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppHeader from '@/components/AppHeader';

type IntakeData = {
  // Basic Information
  venture_name: string;
  stage: string;
  description: string;
  
  // Business & Market Fields
  business_model?: 'saas' | 'hardware' | 'services' | 'marketplace' | 'other';
  target_market?: string;
  revenue_model?: 'subscription' | 'one_time' | 'usage_based' | 'licensing' | 'other';
  current_revenue?: number;
  customer_count?: number;
  has_paying_customers?: boolean;
  funding_raised?: number;
  funding_rounds?: number;
  months_to_runway?: number;
  
  // Team & Organization Fields
  team_size?: number;
  founders_count?: number;
  has_technical_cofounder?: boolean;
  has_business_cofounder?: boolean;
  team_experience_years?: number;
  previous_startups?: number;
  industry_experience?: 'space' | 'aerospace' | 'defense' | 'tech' | 'other';
  key_team_members?: string;
  
  // Technology & Product Fields
  product_type?: 'satellite' | 'ground_system' | 'software' | 'hardware' | 'service';
  technology_readiness_level?: number;
  has_prototype?: boolean;
  has_patents?: boolean;
  patent_count?: number;
  regulatory_requirements?: string[];
  certification_status?: 'none' | 'in_progress' | 'completed';
  
  // Market & Customer Fields
  target_customers?: string;
  customer_segments?: string[];
  market_size_estimate?: number;
  competitive_advantage?: string;
  has_competitors?: boolean;
  competitor_names?: string;
  customer_validation_method?: 'interviews' | 'surveys' | 'pilots' | 'none';
  letters_of_intent?: number;
  pilot_customers?: number;
  
  // Operational Fields
  company_age_months?: number;
  location?: string;
  timezone?: string;
  has_office?: boolean;
  remote_team?: boolean;
  key_partnerships?: string;
  supply_chain_status?: 'local' | 'international' | 'mixed';
  manufacturing_approach?: 'in_house' | 'outsourced' | 'hybrid';
};

export default function Intake() {
  const params = useParams();
  // const _router = useRouter();
  const { currentVenture, refreshVentures } = useVenture();
  const ventureId = params.id as string || currentVenture?.id;
  const isEditing = !!ventureId;
  
  const [formData, setFormData] = useState<IntakeData>({
    venture_name: '',
    stage: 'pre_seed',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  // const [_isLoading, setIsLoading] = useState(isEditing);
  const totalSteps = 6;

  // Load stages and venture data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load stages
        const stagesData = await getStages();
        setStages(stagesData);
        
        // Load venture data if editing
        if (isEditing && ventureId) {
          // If we have currentVenture from context, use it directly
          if (currentVenture && ventureId === currentVenture.id) {
            console.log('Loading venture from context - stage:', currentVenture.stage);
            setFormData({
              venture_name: currentVenture.name || '',
              stage: currentVenture.stage || 'pre_seed',
              description: currentVenture.description || '',
              
              // Business & Market Fields
              business_model: currentVenture.business_model,
              target_market: currentVenture.target_market,
              revenue_model: currentVenture.revenue_model,
              current_revenue: currentVenture.current_revenue,
              customer_count: currentVenture.customer_count,
              has_paying_customers: currentVenture.has_paying_customers,
              funding_raised: currentVenture.funding_raised,
              funding_rounds: currentVenture.funding_rounds,
              months_to_runway: currentVenture.months_to_runway,
              
              // Team & Organization Fields
              team_size: currentVenture.team_size,
              founders_count: currentVenture.founders_count,
              has_technical_cofounder: currentVenture.has_technical_cofounder,
              has_business_cofounder: currentVenture.has_business_cofounder,
              team_experience_years: currentVenture.team_experience_years,
              previous_startups: currentVenture.previous_startups,
              industry_experience: currentVenture.industry_experience,
              key_team_members: currentVenture.key_team_members,
              
              // Technology & Product Fields
              product_type: currentVenture.product_type,
              technology_readiness_level: currentVenture.technology_readiness_level,
              has_prototype: currentVenture.has_prototype,
              has_patents: currentVenture.has_patents,
              patent_count: currentVenture.patent_count,
              regulatory_requirements: currentVenture.regulatory_requirements,
              certification_status: currentVenture.certification_status,
              
              // Market & Customer Fields
              target_customers: currentVenture.target_customers,
              customer_segments: currentVenture.customer_segments,
              market_size_estimate: currentVenture.market_size_estimate,
              competitive_advantage: currentVenture.competitive_advantage,
              has_competitors: currentVenture.has_competitors,
              competitor_names: currentVenture.competitor_names,
              customer_validation_method: currentVenture.customer_validation_method,
              letters_of_intent: currentVenture.letters_of_intent,
              pilot_customers: currentVenture.pilot_customers,
              
              // Operational Fields
              company_age_months: currentVenture.company_age_months,
              location: currentVenture.location,
              timezone: currentVenture.timezone,
              has_office: currentVenture.has_office,
              remote_team: currentVenture.remote_team,
              key_partnerships: currentVenture.key_partnerships,
              supply_chain_status: currentVenture.supply_chain_status,
              manufacturing_approach: currentVenture.manufacturing_approach,
            });
            setIsLoading(false);
          } else {
            // Fallback to API call for other ventures
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const response = await fetch(`/api/ventures/${ventureId}`, {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`
                }
              });
              
              if (response.ok) {
                const responseData = await response.json();
                const { venture } = responseData;
                console.log('Loading venture from API - stage:', venture.stage);
                setFormData({
                venture_name: venture.name || '',
                stage: venture.stage || 'pre_seed',
                description: venture.description || '',
                
                // Business & Market Fields
                business_model: venture.business_model,
                target_market: venture.target_market,
                revenue_model: venture.revenue_model,
                current_revenue: venture.current_revenue,
                customer_count: venture.customer_count,
                has_paying_customers: venture.has_paying_customers,
                funding_raised: venture.funding_raised,
                funding_rounds: venture.funding_rounds,
                months_to_runway: venture.months_to_runway,
                
                // Team & Organization Fields
                team_size: venture.team_size,
                founders_count: venture.founders_count,
                has_technical_cofounder: venture.has_technical_cofounder,
                has_business_cofounder: venture.has_business_cofounder,
                team_experience_years: venture.team_experience_years,
                previous_startups: venture.previous_startups,
                industry_experience: venture.industry_experience,
                key_team_members: venture.key_team_members,
                
                // Technology & Product Fields
                product_type: venture.product_type,
                technology_readiness_level: venture.technology_readiness_level,
                has_prototype: venture.has_prototype,
                has_patents: venture.has_patents,
                patent_count: venture.patent_count,
                regulatory_requirements: venture.regulatory_requirements,
                certification_status: venture.certification_status,
                
                // Market & Customer Fields
                target_customers: venture.target_customers,
                customer_segments: venture.customer_segments,
                market_size_estimate: venture.market_size_estimate,
                competitive_advantage: venture.competitive_advantage,
                has_competitors: venture.has_competitors,
                competitor_names: venture.competitor_names,
                customer_validation_method: venture.customer_validation_method,
                letters_of_intent: venture.letters_of_intent,
                pilot_customers: venture.pilot_customers,
                
                // Operational Fields
                company_age_months: venture.company_age_months,
                location: venture.location,
                timezone: venture.timezone,
                has_office: venture.has_office,
                remote_team: venture.remote_team,
                key_partnerships: venture.key_partnerships,
                supply_chain_status: venture.supply_chain_status,
                manufacturing_approach: venture.manufacturing_approach,
              });
              setIsLoading(false);
            } else {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
              console.error('Failed to load venture data:', response.status, response.statusText, errorData);
              setMessage(`Failed to load venture data: ${errorData.error || 'Unknown error'}`);
              setIsSuccess(false);
              setIsLoading(false);
            }
          } else {
            console.error('No session found');
            setMessage('Please sign in to load venture data');
            setIsSuccess(false);
            setIsLoading(false);
          }
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage('Failed to load venture data');
        setIsSuccess(false);
        setIsLoading(false);
      }
    }
    loadData();
  }, [isEditing, ventureId, currentVenture]);

  // Re-load form data when currentVenture changes (after save)
  useEffect(() => {
    if (isEditing && currentVenture && currentVenture.id === ventureId) {
      console.log('Reloading form data from updated currentVenture - stage:', currentVenture.stage);
      setFormData({
        venture_name: currentVenture.name || '',
        stage: currentVenture.stage || 'pre_seed',
        description: currentVenture.description || '',
        
        // Business & Market Fields
        business_model: currentVenture.business_model,
        target_market: currentVenture.target_market,
        revenue_model: currentVenture.revenue_model,
        current_revenue: currentVenture.current_revenue,
        customer_count: currentVenture.customer_count,
        has_paying_customers: currentVenture.has_paying_customers,
        funding_raised: currentVenture.funding_raised,
        funding_rounds: currentVenture.funding_rounds,
        months_to_runway: currentVenture.months_to_runway,
        
        // Team & Organization Fields
        team_size: currentVenture.team_size,
        founders_count: currentVenture.founders_count,
        has_technical_cofounder: currentVenture.has_technical_cofounder,
        has_business_cofounder: currentVenture.has_business_cofounder,
        team_experience_years: currentVenture.team_experience_years,
        previous_startups: currentVenture.previous_startups,
        industry_experience: currentVenture.industry_experience,
        key_team_members: currentVenture.key_team_members,
        
        // Technology & Product Fields
        product_type: currentVenture.product_type,
        technology_readiness_level: currentVenture.technology_readiness_level,
        has_prototype: currentVenture.has_prototype,
        has_patents: currentVenture.has_patents,
        patent_count: currentVenture.patent_count,
        regulatory_requirements: currentVenture.regulatory_requirements,
        certification_status: currentVenture.certification_status,
        
        // Market & Customer Fields
        target_customers: currentVenture.target_customers,
        customer_segments: currentVenture.customer_segments,
        market_size_estimate: currentVenture.market_size_estimate,
        competitive_advantage: currentVenture.competitive_advantage,
        has_competitors: currentVenture.has_competitors,
        competitor_names: currentVenture.competitor_names,
        customer_validation_method: currentVenture.customer_validation_method,
        letters_of_intent: currentVenture.letters_of_intent,
        pilot_customers: currentVenture.pilot_customers,
        
        // Operational Fields
        company_age_months: currentVenture.company_age_months,
        location: currentVenture.location,
        timezone: currentVenture.timezone,
        has_office: currentVenture.has_office,
        remote_team: currentVenture.remote_team,
        key_partnerships: currentVenture.key_partnerships,
        supply_chain_status: currentVenture.supply_chain_status,
        manufacturing_approach: currentVenture.manufacturing_approach,
      });
    }
  }, [currentVenture, isEditing, ventureId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | string[] | undefined = value;
    
    // Handle different input types
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    if (type === 'number') {
      processedValue = value === '' ? undefined : Number(value);
    }
    
    if (name === 'regulatory_requirements' || name === 'customer_segments') {
      // Handle array fields - split by comma and trim
      processedValue = value.split(',').map((item: string) => item.trim()).filter(Boolean);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.venture_name.trim()) {
      setMessage('Venture name is required');
      setIsSuccess(false);
      return;
    }

    if (formData.venture_name.length < 2) {
      setMessage('Venture name must be at least 2 characters');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('Please sign in to save your venture information');
        setIsSuccess(false);
        return;
      }

      console.log('Saving venture data - stage:', formData.stage);
      const ventureData = {
        name: formData.venture_name.trim(),
        stage: formData.stage,
        description: formData.description,
        
        // Business & Market Fields
        business_model: formData.business_model,
        target_market: formData.target_market,
        revenue_model: formData.revenue_model,
        current_revenue: formData.current_revenue,
        customer_count: formData.customer_count,
        has_paying_customers: formData.has_paying_customers,
        funding_raised: formData.funding_raised,
        funding_rounds: formData.funding_rounds,
        months_to_runway: formData.months_to_runway,
        
        // Team & Organization Fields
        team_size: formData.team_size,
        founders_count: formData.founders_count,
        has_technical_cofounder: formData.has_technical_cofounder,
        has_business_cofounder: formData.has_business_cofounder,
        team_experience_years: formData.team_experience_years,
        previous_startups: formData.previous_startups,
        industry_experience: formData.industry_experience,
        key_team_members: formData.key_team_members,
        
        // Technology & Product Fields
        product_type: formData.product_type,
        technology_readiness_level: formData.technology_readiness_level,
        has_prototype: formData.has_prototype,
        has_patents: formData.has_patents,
        patent_count: formData.patent_count,
        regulatory_requirements: formData.regulatory_requirements,
        certification_status: formData.certification_status,
        
        // Market & Customer Fields
        target_customers: formData.target_customers,
        customer_segments: formData.customer_segments,
        market_size_estimate: formData.market_size_estimate,
        competitive_advantage: formData.competitive_advantage,
        has_competitors: formData.has_competitors,
        competitor_names: formData.competitor_names,
        customer_validation_method: formData.customer_validation_method,
        letters_of_intent: formData.letters_of_intent,
        pilot_customers: formData.pilot_customers,
        
        // Operational Fields
        company_age_months: formData.company_age_months,
        location: formData.location,
        timezone: formData.timezone,
        has_office: formData.has_office,
        remote_team: formData.remote_team,
        key_partnerships: formData.key_partnerships,
        supply_chain_status: formData.supply_chain_status,
        manufacturing_approach: formData.manufacturing_approach,
      };

      let error;
      if (isEditing && ventureId) {
        // Update existing venture
        const { error: updateError } = await supabase
          .from('ventures')
          .update(ventureData)
          .eq('id', ventureId);
        error = updateError;
      } else {
        // Create new venture
        const { error: insertError } = await supabase.from('ventures').insert({
          id: crypto.randomUUID(),
          org_id: null,
          user_id: user.id,
        profile_type: 'default',
          ...ventureData
      });
        error = insertError;
      }

      if (error) {
        console.error('Database error:', error);
        setMessage(`Failed to save: ${error.message}`);
        setIsSuccess(false);
      } else {
        setMessage(isEditing ? 'Venture information updated successfully!' : 'Venture information saved successfully!');
        setIsSuccess(true);
        
        // Refresh ventures list to update the venture selector
        await refreshVentures(ventureId);
        
        if (!isEditing) {
          // Reset form only for new ventures
        setFormData({
          venture_name: '',
          stage: 'pre_seed',
          description: ''
        });
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage('An unexpected error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader showNavigation={false} showBackButton={true} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Venture Intake</h1>
            <p className="mt-2 text-gray-600">
              Tell us about your space venture to get started with the readiness assessment
            </p>
          </div>


          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < totalSteps && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600 text-center">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="venture_name" className="block text-sm font-medium text-gray-700">
                Venture Name *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="venture_name"
                  id="venture_name"
                  required
                  value={formData.venture_name}
                  onChange={handleInputChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your venture name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                Funding Stage *
              </label>
              <div className="mt-1">
                      <Select
                  value={formData.stage}
                        onValueChange={(value) => handleSelectChange('stage', value)}
                >
                        <SelectTrigger>
                          <SelectValue placeholder="Select funding stage" />
                        </SelectTrigger>
                        <SelectContent>
                  {stages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                            </SelectItem>
                  ))}
                        </SelectContent>
                      </Select>
                    </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Venture Description
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Describe your space venture, mission, and key objectives..."
                />
              </div>
                </div>
              </div>
            )}

            {/* Step 2: Business & Market */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Business & Market</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="business_model" className="block text-sm font-medium text-gray-700">
                      Business Model
                    </label>
                    <div className="mt-1">
                      <Select
                        value={formData.business_model || ''}
                        onValueChange={(value) => handleSelectChange('business_model', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="hardware">Hardware</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="revenue_model" className="block text-sm font-medium text-gray-700">
                      Revenue Model
                    </label>
                    <div className="mt-1">
                      <Select
                        value={formData.revenue_model || ''}
                        onValueChange={(value) => handleSelectChange('revenue_model', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select revenue model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="one_time">One-time</SelectItem>
                          <SelectItem value="usage_based">Usage-based</SelectItem>
                          <SelectItem value="licensing">Licensing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="target_market" className="block text-sm font-medium text-gray-700">
                    Target Market
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="target_market"
                      id="target_market"
                      value={formData.target_market || ''}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="e.g., satellite operators, defense contractors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="current_revenue" className="block text-sm font-medium text-gray-700">
                      Current Revenue (EUR)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="current_revenue"
                        id="current_revenue"
                        value={formData.current_revenue || ''}
                        onChange={handleInputChange}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="customer_count" className="block text-sm font-medium text-gray-700">
                      Customer Count
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="customer_count"
                        id="customer_count"
                        value={formData.customer_count || ''}
                        onChange={handleInputChange}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_paying_customers"
                    id="has_paying_customers"
                    checked={formData.has_paying_customers || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="has_paying_customers" className="ml-2 block text-sm text-gray-900">
                    Has paying customers
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Team & Organization */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Team & Organization</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="industry_experience" className="block text-sm font-medium text-gray-700">
                      Industry Experience
                    </label>
                    <div className="mt-1">
                      <Select
                        value={formData.industry_experience || ''}
                        onValueChange={(value) => handleSelectChange('industry_experience', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="space">Space</SelectItem>
                          <SelectItem value="aerospace">Aerospace</SelectItem>
                          <SelectItem value="defense">Defense</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="team_size" className="block text-sm font-medium text-gray-700">
                      Team Size
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="team_size"
                        id="team_size"
                        value={formData.team_size || ''}
                        onChange={handleInputChange}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="founders_count" className="block text-sm font-medium text-gray-700">
                      Number of Founders
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="founders_count"
                        id="founders_count"
                        value={formData.founders_count || ''}
                        onChange={handleInputChange}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="has_technical_cofounder"
                      id="has_technical_cofounder"
                      checked={formData.has_technical_cofounder || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has_technical_cofounder" className="ml-2 block text-sm text-gray-900">
                      Has technical cofounder
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="has_business_cofounder"
                      id="has_business_cofounder"
                      checked={formData.has_business_cofounder || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has_business_cofounder" className="ml-2 block text-sm text-gray-900">
                      Has business cofounder
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="key_team_members" className="block text-sm font-medium text-gray-700">
                    Key Team Members
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="key_team_members"
                      id="key_team_members"
                      rows={3}
                      value={formData.key_team_members || ''}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="Brief description of key team members and their backgrounds..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Technology & Product */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Technology & Product</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="product_type" className="block text-sm font-medium text-gray-700">
                      Product Type
                    </label>
                    <div className="mt-1">
                      <Select
                        value={formData.product_type || ''}
                        onValueChange={(value) => handleSelectChange('product_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="satellite">Satellite</SelectItem>
                          <SelectItem value="ground_system">Ground System</SelectItem>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="hardware">Hardware</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="technology_readiness_level" className="block text-sm font-medium text-gray-700">
                      Technology Readiness Level (TRL)
                    </label>
                    <div className="mt-1">
                      <Select
                        value={formData.technology_readiness_level?.toString() || ''}
                        onValueChange={(value) => handleSelectChange('technology_readiness_level', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select TRL" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                              TRL {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="has_prototype"
                      id="has_prototype"
                      checked={formData.has_prototype || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has_prototype" className="ml-2 block text-sm text-gray-900">
                      Has prototype
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="has_patents"
                      id="has_patents"
                      checked={formData.has_patents || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has_patents" className="ml-2 block text-sm text-gray-900">
                      Has patents
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="regulatory_requirements" className="block text-sm font-medium text-gray-700">
                    Regulatory Requirements
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="regulatory_requirements"
                      id="regulatory_requirements"
                      value={formData.regulatory_requirements?.join(', ') || ''}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="e.g., FCC, ITAR, Export Control (comma-separated)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Market & Customer */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Market & Customer</h3>
                
                <div>
                  <label htmlFor="target_customers" className="block text-sm font-medium text-gray-700">
                    Target Customers
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="target_customers"
                      id="target_customers"
                      value={formData.target_customers || ''}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="Who are your target customers?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="customer_segments" className="block text-sm font-medium text-gray-700">
                    Customer Segments
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="customer_segments"
                      id="customer_segments"
                      value={formData.customer_segments?.join(', ') || ''}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="e.g., commercial, government, defense (comma-separated)"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="market_size_estimate" className="block text-sm font-medium text-gray-700">
                    Market Size Estimate (TAM in billions USD)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="market_size_estimate"
                      id="market_size_estimate"
                      value={formData.market_size_estimate || ''}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="competitive_advantage" className="block text-sm font-medium text-gray-700">
                    Competitive Advantage
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="competitive_advantage"
                      id="competitive_advantage"
                      rows={3}
                      value={formData.competitive_advantage || ''}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="What makes your solution unique or better than competitors?"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_competitors"
                    id="has_competitors"
                    checked={formData.has_competitors || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="has_competitors" className="ml-2 block text-sm text-gray-900">
                    Has identified competitors
                  </label>
                </div>

                <div>
                  <label htmlFor="letters_of_intent" className="block text-sm font-medium text-gray-700">
                    Letters of Intent
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="letters_of_intent"
                      id="letters_of_intent"
                      value={formData.letters_of_intent || ''}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Operational */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Operational</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company_age_months" className="block text-sm font-medium text-gray-700">
                      Company Age (months)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="company_age_months"
                        id="company_age_months"
                        value={formData.company_age_months || ''}
                        onChange={handleInputChange}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location || ''}
                        onChange={handleInputChange}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="has_office"
                      id="has_office"
                      checked={formData.has_office || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has_office" className="ml-2 block text-sm text-gray-900">
                      Has office space
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="remote_team"
                      id="remote_team"
                      checked={formData.remote_team || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remote_team" className="ml-2 block text-sm text-gray-900">
                      Remote team
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="key_partnerships" className="block text-sm font-medium text-gray-700">
                    Key Partnerships
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="key_partnerships"
                      id="key_partnerships"
                      rows={3}
                      value={formData.key_partnerships || ''}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="Describe key partnerships and strategic relationships..."
                    />
                  </div>
            </div>

            <div>
                  <label htmlFor="supply_chain_status" className="block text-sm font-medium text-gray-700">
                    Supply Chain Status
                  </label>
                  <div className="mt-1">
                    <Select
                      value={formData.supply_chain_status || ''}
                      onValueChange={(value) => handleSelectChange('supply_chain_status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supply chain status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save Venture Information'
                )}
              </button>
              )}
            </div>
          </form>

          {/* Status Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-md ${
              isSuccess 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {isSuccess ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isSuccess ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {isSuccess && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Next Steps</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Great! Now you can:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Upload supporting documents (pitch deck, technical reports)</li>
                      <li>Run an assessment to get your readiness scores</li>
                      <li>View your progress in the dashboard</li>
                    </ul>
                  </div>
                  <div className="mt-3 flex space-x-3">
                    <Link
                      href="/upload"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Upload Files →
                    </Link>
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Go to Dashboard →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
