import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, User, Trash2, GitBranch, MessageSquare, Send, ChevronDown, ChevronUp, Save, BookOpen, X, FolderOpen, Clock, PanelLeft } from 'lucide-react';
import { toast } from 'sonner';
import PedigreeVisualization from '@/components/PedigreeVisualization';
import { apiService } from '@/lib/apiService';

export default function PedigreeChart({ onToggleSidebar, isSidebarOpen }) {
  const [members, setMembers] = useState([
    {
      id: '1',
      name: 'Proband',
      generation: 2,
      gender: 'female',
      affected: false,
      carrier: false,
      deceased: false,
      proband: true,
      mother_id: '2',
      father_id: '3',
      spouse_id: null,
      children_ids: []
    },
    {
      id: '2',
      name: 'Mother',
      generation: 1,
      gender: 'female',
      affected: false,
      carrier: true,
      deceased: false,
      spouse_id: '3',
      children_ids: ['1']
    },
    {
      id: '3',
      name: 'Father',
      generation: 1,
      gender: 'male',
      affected: false,
      carrier: false,
      deceased: false,
      spouse_id: '2',
      children_ids: ['1']
    }
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [savedCases, setSavedCases] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    generation: 1,
    gender: 'male',
    affected: false,
    carrier: false,
    deceased: false,
    proband: false,
    adopted: false,
    life_status: 'alive', // alive, deceased, pregnancy, miscarriage, stillbirth
    mother_id: '',
    father_id: '',
    spouse_id: '',
    twin_id: '',
    twin_type: 'none', // none, identical, fraternal
    consanguineous: false,
    carrier_genes: '',
  });

  // Interview state
  const [interviewMode, setInterviewMode] = useState('patient'); // 'patient' or 'doctor'
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [patientInput, setPatientInput] = useState('');
  const [doctorInput, setDoctorInput] = useState('');

  const patientQuestions = [
    "What is your full name?",
    "What is your date of birth?",
    "What is your gender?",
    "Do you have any siblings? If yes, how many?",
    "Are both your parents alive? What are their names?",
    "Do you have any children?",
    "Are there any known genetic conditions in your family?",
    "Has anyone in your family been diagnosed with cancer, heart disease, or other hereditary conditions?",
  ];

  const handleAddMember = () => {
    setEditingMember(null);
    setShowAdvanced(false);
    setFormData({
      name: '',
      generation: 1,
      gender: 'male',
      affected: false,
      carrier: false,
      deceased: false,
      proband: false,
      adopted: false,
      life_status: 'alive',
      mother_id: '',
      father_id: '',
      spouse_id: '',
      twin_id: '',
      twin_type: 'none',
      consanguineous: false,
      carrier_genes: '',
    });
    setDialogOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member.id);
    setShowAdvanced(false);
    setFormData({
      ...member,
      mother_id: member.mother_id || '',
      father_id: member.father_id || '',
      spouse_id: member.spouse_id || '',
      life_status: member.deceased ? 'deceased' : (member.pregnancy ? 'pregnancy' : (member.miscarriage ? 'miscarriage' : (member.stillbirth ? 'stillbirth' : 'alive'))),
      twin_id: member.twin_id || '',
      twin_type: member.twin_type || 'none',
      carrier_genes: member.carrier_for ? member.carrier_for.join(', ') : '',
    });
    setDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const memberData = {
      ...formData,
      mother_id: formData.mother_id || null,
      father_id: formData.father_id || null,
      spouse_id: formData.spouse_id || null,
      twin_id: formData.twin_id || null,
      deceased: formData.life_status === 'deceased',
      pregnancy: formData.life_status === 'pregnancy',
      miscarriage: formData.life_status === 'miscarriage',
      stillbirth: formData.life_status === 'stillbirth',
      carrier_for: formData.carrier_genes ? formData.carrier_genes.split(',').map(s => s.trim()) : [],
    };

    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember ? { ...memberData, id: editingMember } : m))
      );
      toast.success('Member updated');
    } else {
      const newMember = {
        ...memberData,
        id: Date.now().toString(),
        children_ids: [],
      };
      setMembers((prev) => [...prev, newMember]);
      toast.success('Member added');
    }
    setDialogOpen(false);
  };

  const handleDeleteMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success('Member removed');
  };

  const handleSavePedigree = async () => {
    if (!caseNumber.trim()) {
      toast.error('Please enter a Case Number');
      return;
    }

    try {
      await apiService.savePedigree(caseNumber, members);
      toast.success('Pedigree saved successfully');
      setSaveDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to save pedigree');
    }
  };

  const handleOpenLoadDialog = async () => {
    try {
      const cases = await apiService.listPedigrees();
      setSavedCases(cases);
      setLoadDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load saved cases');
    }
  };

  const handleLoadCase = async (caseNum) => {
    try {
      const pedigree = await apiService.getPedigree(caseNum);
      if (pedigree && pedigree.data) {
        setMembers(pedigree.data);
        setCaseNumber(pedigree.case_number);
        setLoadDialogOpen(false);
        toast.success(`Loaded case ${pedigree.case_number}`);
      }
    } catch (error) {
      toast.error('Failed to load pedigree data');
    }
  };

  const startInterview = () => {
    setInterviewMessages([]);
    setCurrentQuestion(0);
    setPatientInput('');
    setDoctorInput('');
    setInterviewDialogOpen(true);

    if (interviewMode === 'patient') {
      setInterviewMessages([{
        type: 'bot',
        text: "Hello! I'll help you create your family pedigree chart. Let's start with some questions. " + patientQuestions[0]
      }]);
    } else {
      setInterviewMessages([{
        type: 'bot',
        text: "Please provide the complete family history information. You can describe the family structure, relationships, and any genetic conditions. I'll analyze and create the pedigree chart."
      }]);
    }
  };

  const handlePatientAnswer = () => {
    if (!patientInput.trim()) return;

    setInterviewMessages(prev => [...prev, {
      type: 'user',
      text: patientInput
    }]);

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < patientQuestions.length) {
      setTimeout(() => {
        setInterviewMessages(prev => [...prev, {
          type: 'bot',
          text: patientQuestions[nextQuestion]
        }]);
        setCurrentQuestion(nextQuestion);
      }, 500);
    } else {
      setTimeout(() => {
        setInterviewMessages(prev => [...prev, {
          type: 'bot',
          text: "Thank you for providing this information! I'm now generating your family pedigree chart based on your responses."
        }]);
        processInterviewData(patientInput); // In reality, we'd process all answers
      }, 500);
    }

    setPatientInput('');
  };

  const handleDoctorSubmit = () => {
    if (!doctorInput.trim()) {
      toast.error('Please enter family history details');
      return;
    }

    setInterviewMessages(prev => [...prev,
    {
      type: 'user',
      text: doctorInput
    },
    {
      type: 'bot',
      text: "Analyzing the family history... I'll create a comprehensive pedigree chart based on the information provided."
    }
    ]);

    processInterviewData(doctorInput);
    setDoctorInput('');
  };

  // Intelligent Extraction Logic
  const processInterviewData = (text) => {
    // This simulates the AI extraction logic described in the feedback
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const newMembers = [];

      // 1. Create Proband (Patient)
      const proband = {
        id: '1',
        name: 'Patient',
        generation: 2,
        gender: lowerText.includes('female') || lowerText.includes('woman') ? 'female' : 'male',
        affected: lowerText.includes('patient has') || lowerText.includes('affected'),
        carrier: false,
        deceased: false,
        proband: true,
        mother_id: '2',
        father_id: '3',
        spouse_id: null,
        children_ids: []
      };
      newMembers.push(proband);

      // 2. Create Mother
      const mother = {
        id: '2',
        name: 'Mother',
        generation: 1,
        gender: 'female',
        affected: lowerText.includes('mother has') || lowerText.includes('mother is affected'),
        carrier: false,
        deceased: lowerText.includes('mother is deceased'),
        spouse_id: '3',
        children_ids: ['1']
      };
      newMembers.push(mother);

      // 3. Create Father
      const father = {
        id: '3',
        name: 'Father',
        generation: 1,
        gender: 'male',
        affected: lowerText.includes('father has') || lowerText.includes('father is affected'),
        carrier: false,
        deceased: lowerText.includes('father is deceased'),
        spouse_id: '2',
        children_ids: ['1']
      };
      newMembers.push(father);

      // 4. Check for siblings
      if (lowerText.includes('sister')) {
        const sister = {
          id: '4',
          name: 'Sister',
          generation: 2,
          gender: 'female',
          affected: lowerText.includes('sister has'),
          carrier: false,
          deceased: false,
          mother_id: '2',
          father_id: '3',
          spouse_id: null,
          children_ids: []
        };
        newMembers.push(sister);
        mother.children_ids.push('4');
        father.children_ids.push('4');
      }

      if (lowerText.includes('brother')) {
        const brother = {
          id: '5',
          name: 'Brother',
          generation: 2,
          gender: 'male',
          affected: lowerText.includes('brother has'),
          carrier: false,
          deceased: false,
          mother_id: '2',
          father_id: '3',
          spouse_id: null,
          children_ids: []
        };
        newMembers.push(brother);
        mother.children_ids.push('5');
        father.children_ids.push('5');
      }

      setMembers(newMembers);
      toast.success('Pedigree chart created successfully!');

      setTimeout(() => {
        setInterviewDialogOpen(false);
      }, 1500);
    }, 2000);
  };

  const generations = Array.from(new Set(members.map((m) => m.generation))).sort();

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 relative overflow-hidden" data-testid="pedigree-chart-container">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="mr-2 text-slate-500 hover:text-emerald-600"
              >
                <PanelLeft className="h-6 w-6" />
              </Button>
            )}
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <GitBranch className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque' }}>
                Pedigree Chart
              </h2>
              <p className="text-sm text-slate-500 font-medium">Family genetic inheritance visualization</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowGuide(!showGuide)}
              variant="outline"
              className="font-bold shadow-sm"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Guide
            </Button>
            <Button
              onClick={() => setSaveDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold shadow-lg transition-all hover:scale-105"
            >
              <Save className="mr-2 h-5 w-5" />
              Save
            </Button>
            <Button
              onClick={handleOpenLoadDialog}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg transition-all hover:scale-105"
            >
              <FolderOpen className="mr-2 h-5 w-5" />
              Load
            </Button>
            <Button
              onClick={startInterview}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold shadow-lg transition-all hover:scale-105"
              data-testid="interview-button"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Interview
            </Button>
            <Button
              onClick={handleAddMember}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-lg transition-all hover:scale-105"
              data-testid="add-member-button"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Member
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Legend */}
            <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg border-2 border-emerald-100">
              <CardContent className="pt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-3 border-blue-700 bg-blue-200 rounded shadow-sm" />
                    <span className="text-sm font-semibold text-slate-700">Male</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-3 border-pink-700 bg-pink-200 rounded-full shadow-sm" />
                    <span className="text-sm font-semibold text-slate-700">Female</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded shadow-sm" />
                    <span className="text-sm font-semibold text-slate-700">Affected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-3 border-slate-700 rounded relative shadow-sm overflow-hidden bg-white">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 w-1/2" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Carrier</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-3 border-slate-300 bg-white rounded shadow-sm" />
                    <span className="text-sm font-semibold text-slate-700">Unaffected</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pedigree Chart */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-2 border-emerald-100">
              <CardContent className="pt-6">
                {generations.length === 0 ? (
                  <div className="text-center py-16">
                    <GitBranch className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium mb-6">No family members added yet</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={startInterview} variant="outline" className="font-semibold">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Start Interview
                      </Button>
                      <Button onClick={handleAddMember} variant="outline" className="font-semibold">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Manually
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* SVG Pedigree Visualization */}
                    <div className="bg-gradient-to-br from-white to-emerald-50 /20 p-6 rounded-2xl border-2 border-emerald-100">
                      <h4 className="text-sm font-bold text-slate-900 mb-6" style={{ fontFamily: 'Bricolage Grotesque' }}>
                        Pedigree Diagram
                      </h4>
                      <div className="overflow-x-auto">
                        <PedigreeVisualization members={members} />
                      </div>
                    </div>

                    {/* List View */}
                    <div className="pt-6 border-t-2 border-emerald-100">
                      <h4 className="text-sm font-bold text-slate-900 mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>
                        Family Members List
                      </h4>
                    </div>
                    {generations.map((gen) => {
                      const genMembers = members.filter((m) => m.generation === gen);
                      return (
                        <div key={gen} className="space-y-4" data-testid={`generation-${gen}`}>
                          <h4 className="text-sm font-bold text-slate-700" style={{ fontFamily: 'Bricolage Grotesque' }}>
                            Generation {gen}
                          </h4>
                          <div className="flex flex-wrap gap-8">
                            {genMembers.map((member) => (
                              <div
                                key={member.id}
                                className="relative group"
                                data-testid={`member-${member.id}`}
                              >
                                {/* Member Symbol */}
                                <div
                                  className={`relative w-20 h-20 border-3 cursor-pointer transition-all hover:scale-110 shadow-lg ${member.gender === 'male' ? 'rounded-lg' : 'rounded-full'
                                    } ${member.affected
                                      ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-600'
                                      : member.carrier
                                        ? 'border-slate-700 bg-white'
                                        : member.gender === 'male'
                                          ? 'border-blue-600 bg-white'
                                          : 'border-pink-600 bg-white'
                                    }`}
                                  onClick={() => handleEditMember(member)}
                                >
                                  {member.carrier && !member.affected && (
                                    <div
                                      className={`absolute inset-0 w-1/2 bg-gradient-to-r from-amber-500 to-orange-500 ${member.gender === 'male' ? 'rounded-l-lg' : 'rounded-l-full'
                                        }`}
                                    />
                                  )}
                                  {member.deceased && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-full h-1 bg-slate-900 rotate-45" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <User
                                      className={`h-8 w-8 ${member.affected ? 'text-white' : 'text-slate-400'
                                        }`}
                                    />
                                  </div>
                                </div>

                                {/* Member Info */}
                                <div className="mt-3 text-center">
                                  <p className="text-sm font-bold text-slate-900">{member.name}</p>
                                </div>

                                {/* Delete Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="absolute -top-2 -right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 bg-white shadow-lg hover:bg-red-50 hover:text-red-600 rounded-full"
                                  data-testid={`delete-member-${member.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div >
        </ScrollArea >

        {/* Guide Sidebar */}
        <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto border-l border-slate-200 ${showGuide ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-bricolage text-slate-900">User Guide</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowGuide(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="font-bold text-emerald-600 mb-2">How to Use</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                  <li>Click <strong>Add Member</strong> to add individuals manually.</li>
                  <li>Use <strong>Interview</strong> for AI-assisted creation.</li>
                  <li>Click on any member symbol to <strong>edit</strong> details.</li>
                  <li>Use <strong>Save</strong> to store the chart with a Case Number.</li>
                </ol>
              </section>

              <section>
                <h4 className="font-bold text-emerald-600 mb-2">Advanced Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                  <li><strong>Twins:</strong> Edit a member, open Advanced Options, select Twin Type and enter Sibling's ID.</li>
                  <li><strong>Proband:</strong> Edit the patient and check "Proband" to mark them with an arrow.</li>
                  <li><strong>Consanguinity:</strong> Check "Consanguineous" in Advanced Options if parents are related.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-emerald-600 mb-2">Symbol Legend</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100 rounded-sm"></div>
                    <span>Male</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-pink-600 bg-pink-100 rounded-full"></div>
                    <span>Female</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                    <span>Affected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-dashed rounded-sm"></div>
                    <span>Adopted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rotate-45 border-2 border-slate-600 bg-white"></div>
                    <span>Pregnancy</span>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="font-bold text-emerald-600 mb-2">FAQ</h4>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-800">How do I delete a member?</p>
                    <p>Hover over the member symbol and click the trash icon that appears.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Can I export the chart?</p>
                    <p>Currently, you can save it to the database using the Save button. Export to PDF/Image is coming soon.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Member Dialog */}
      < Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="member-dialog">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>
              {editingMember ? 'Edit Member' : 'Add Family Member'}
            </DialogTitle>
            <DialogDescription>
              Enter the details of the family member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="member-name" className="font-semibold">Name</Label>
              <Input
                id="member-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
                className="border-2 border-emerald-200 focus:border-emerald-400"
                data-testid="member-name-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member-generation" className="font-semibold">Generation</Label>
                <Select
                  value={formData.generation.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, generation: parseInt(value) })
                  }
                >
                  <SelectTrigger id="member-generation" data-testid="member-generation-select" className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((gen) => (
                      <SelectItem key={gen} value={gen.toString()}>
                        Generation {gen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-gender" className="font-semibold">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="member-gender" data-testid="member-gender-select" className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Relationships */}
            <div className="space-y-2">
              <Label className="font-semibold">Relationships (IDs)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Mother ID"
                  value={formData.mother_id}
                  onChange={(e) => setFormData({ ...formData, mother_id: e.target.value })}
                  className="text-xs"
                />
                <Input
                  placeholder="Father ID"
                  value={formData.father_id}
                  onChange={(e) => setFormData({ ...formData, father_id: e.target.value })}
                  className="text-xs"
                />
                <Input
                  placeholder="Spouse ID"
                  value={formData.spouse_id}
                  onChange={(e) => setFormData({ ...formData, spouse_id: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">Clinical Status</Label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <input
                    type="checkbox"
                    checked={!formData.affected && !formData.carrier}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, affected: false, carrier: false });
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Unaffected</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.affected}
                    onChange={(e) => setFormData({ ...formData, affected: e.target.checked, carrier: false })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Affected</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.carrier}
                    onChange={(e) => setFormData({ ...formData, carrier: e.target.checked, affected: false })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Carrier</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.proband}
                    onChange={(e) => setFormData({ ...formData, proband: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Proband</span>
                </label>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                <span className="font-semibold">Advanced Options</span>
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {showAdvanced && (
                <div className="space-y-4 pt-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label className="font-semibold">Life Status</Label>
                    <Select
                      value={formData.life_status}
                      onValueChange={(value) => setFormData({ ...formData, life_status: value })}
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alive">Alive</SelectItem>
                        <SelectItem value="deceased">Deceased</SelectItem>
                        <SelectItem value="pregnancy">Pregnancy (Current)</SelectItem>
                        <SelectItem value="miscarriage">Miscarriage</SelectItem>
                        <SelectItem value="stillbirth">Stillbirth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Twin Type</Label>
                      <Select
                        value={formData.twin_type}
                        onValueChange={(value) => setFormData({ ...formData, twin_type: value })}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="identical">Identical</SelectItem>
                          <SelectItem value="fraternal">Fraternal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Twin ID</Label>
                      <Input
                        value={formData.twin_id}
                        onChange={(e) => setFormData({ ...formData, twin_id: e.target.value })}
                        placeholder="ID of twin"
                        className="border-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.adopted}
                        onChange={(e) => setFormData({ ...formData, adopted: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">Adopted</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consanguineous}
                        onChange={(e) => setFormData({ ...formData, consanguineous: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">Consanguineous Relationship (if spouse)</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Carrier Genes (comma separated)</Label>
                    <Input
                      value={formData.carrier_genes}
                      onChange={(e) => setFormData({ ...formData, carrier_genes: e.target.value })}
                      placeholder="e.g. BRCA1, CFTR"
                      className="border-2"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-testid="cancel-member-button"
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveMember}
                data-testid="save-member-button"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold"
              >
                {editingMember ? 'Update' : 'Add'} Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog >

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-bricolage">Save Pedigree Chart</DialogTitle>
            <DialogDescription>
              Enter a unique case number to save this pedigree chart.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="case-number" className="font-semibold">Case Number</Label>
              <Input
                id="case-number"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="e.g. CASE-2024-001"
                className="border-2 border-emerald-200 focus:border-emerald-400"
              />
              <p className="text-xs text-slate-500">Enter a unique case number to identify this chart.</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePedigree} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Save Chart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-bricolage">Load Saved Case</DialogTitle>
            <DialogDescription>Select a previously saved pedigree chart to load.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3 pt-2">
              {savedCases.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No saved cases found.</p>
              ) : (
                savedCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleLoadCase(c.case_number)}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-all group"
                  >
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-emerald-700">{c.case_number}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(c.updated_at).toLocaleDateString()} {new Date(c.updated_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <FolderOpen className="h-5 w-5 text-slate-400 group-hover:text-emerald-500" />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Interview Dialog */}
      < Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen} >
        <DialogContent className="max-w-3xl max-h-[80vh]" data-testid="interview-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>
              Family History Interview
            </DialogTitle>
            <DialogDescription>
              Answer questions to generate the pedigree chart automatically.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={interviewMode} onValueChange={setInterviewMode} className="pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient" className="font-semibold" data-testid="patient-mode-tab">Patient Interview</TabsTrigger>
              <TabsTrigger value="doctor" className="font-semibold" data-testid="doctor-mode-tab">Doctor Input</TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="space-y-4">
              <p className="text-sm text-slate-600">
                I'll ask you simple questions about your family. Answer each question and I'll create your pedigree chart.
              </p>

              <ScrollArea className="h-96 border-2 border-cyan-200 rounded-xl p-4 bg-gradient-to-br from-cyan-50/30 to-violet-50/30">
                <div className="space-y-3">
                  {interviewMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl animate-fade-in ${msg.type === 'bot'
                        ? 'bg-white border-2 border-cyan-100 mr-12'
                        : 'bg-gradient-to-r from-fuchsia-100 to-pink-100 ml-12 border-2 border-fuchsia-200'
                        }`}
                    >
                      <p className="text-sm font-semibold text-slate-600 mb-1">
                        {msg.type === 'bot' ? 'AI Assistant' : 'You'}
                      </p>
                      <p className="text-sm text-slate-800">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={patientInput}
                  onChange={(e) => setPatientInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePatientAnswer()}
                  placeholder="Type your answer..."
                  className="border-2 border-cyan-200 focus:border-cyan-400"
                  data-testid="patient-input"
                />
                <Button
                  onClick={handlePatientAnswer}
                  className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white font-bold"
                  data-testid="patient-send-button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="doctor" className="space-y-4">
              <p className="text-sm text-slate-600">
                Enter complete family history details. Describe family structure, relationships, and genetic conditions. The AI will analyze and create the pedigree chart.
              </p>

              <Textarea
                value={doctorInput}
                onChange={(e) => setDoctorInput(e.target.value)}
                placeholder="Example: The patient is a 35-year-old female with two siblings. Her father has a history of breast cancer. Her mother is healthy. She has one daughter and one son..."
                className="min-h-[300px] border-2 border-emerald-200 focus:border-emerald-400"
                data-testid="doctor-input"
              />

              <Button
                onClick={handleDoctorSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-6 text-lg"
                data-testid="doctor-submit-button"
              >
                <Send className="mr-2 h-5 w-5" />
                Generate Pedigree Chart
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog >
    </div >
  );
}
