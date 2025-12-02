import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, User, Trash2, GitBranch, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function PedigreeChart() {
  const [members, setMembers] = useState([
    {
      id: '1',
      name: 'Proband',
      generation: 1,
      gender: 'male',
      position: 1,
      affected: true,
      carrier: false,
      deceased: false,
    },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    generation: 1,
    gender: 'male',
    position: 1,
    affected: false,
    carrier: false,
    deceased: false,
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
    setFormData({
      name: '',
      generation: 1,
      gender: 'male',
      position: members.filter((m) => m.generation === 1).length + 1,
      affected: false,
      carrier: false,
      deceased: false,
    });
    setDialogOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member.id);
    setFormData(member);
    setDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember ? { ...formData, id: editingMember } : m))
      );
      toast.success('Member updated');
    } else {
      const newMember = {
        ...formData,
        id: Date.now().toString(),
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

    // Add user message
    setInterviewMessages(prev => [...prev, {
      type: 'user',
      text: patientInput
    }]);

    // Move to next question
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
        processInterviewData();
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

    processInterviewData();
    setDoctorInput('');
  };

  const processInterviewData = () => {
    // Simulate processing and creating pedigree members
    setTimeout(() => {
      const newMembers = [
        {
          id: Date.now().toString(),
          name: 'Patient',
          generation: 2,
          gender: 'female',
          position: 1,
          affected: false,
          carrier: true,
          deceased: false,
        },
        {
          id: (Date.now() + 1).toString(),
          name: 'Father',
          generation: 1,
          gender: 'male',
          position: 1,
          affected: true,
          carrier: false,
          deceased: false,
        },
        {
          id: (Date.now() + 2).toString(),
          name: 'Mother',
          generation: 1,
          gender: 'female',
          position: 2,
          affected: false,
          carrier: false,
          deceased: false,
        },
      ];

      setMembers(prev => [...prev, ...newMembers]);
      toast.success('Pedigree chart created successfully!');
      
      setTimeout(() => {
        setInterviewDialogOpen(false);
      }, 1500);
    }, 2000);
  };

  const generations = Array.from(new Set(members.map((m) => m.generation))).sort();

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30" data-testid="pedigree-chart-container">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              onClick={startInterview}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold shadow-lg transition-all hover:scale-105"
              data-testid="interview-button"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Family History Interview
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

      {/* Pedigree Visualization */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Legend */}
          <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg border-2 border-emerald-100">
            <CardContent className="pt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-600 rounded shadow-sm" />
                  <span className="text-sm font-semibold text-slate-700">Male</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-3 border-pink-600 rounded-full shadow-sm" />
                  <span className="text-sm font-semibold text-slate-700">Female</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded shadow-sm" />
                  <span className="text-sm font-semibold text-slate-700">Affected</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-3 border-slate-700 rounded relative shadow-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 w-1/2" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Carrier</span>
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
                              {gen < Math.max(...generations) && (
                                <div className="absolute top-full left-1/2 w-0.5 h-8 bg-emerald-300" />
                              )}

                              {/* Member Symbol */}
                              <div
                                className={`relative w-20 h-20 border-3 cursor-pointer transition-all hover:scale-110 shadow-lg ${
                                  member.gender === 'male' ? 'rounded-lg' : 'rounded-full'
                                } ${
                                  member.affected
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
                                    className={`absolute inset-0 w-1/2 bg-gradient-to-r from-amber-500 to-orange-500 ${
                                      member.gender === 'male' ? 'rounded-l-lg' : 'rounded-l-full'
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
                                    className={`h-8 w-8 ${
                                      member.affected ? 'text-white' : 'text-slate-400'
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
        </div>
      </ScrollArea>

      {/* Add/Edit Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-testid="member-dialog">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>
              {editingMember ? 'Edit Member' : 'Add Family Member'}
            </DialogTitle>
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

            <div className="space-y-3">
              <Label className="font-semibold">Status</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.affected}
                    onChange={(e) => setFormData({ ...formData, affected: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300"
                    data-testid="member-affected-checkbox"
                  />
                  <span className="text-sm font-medium text-slate-700">Affected</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.carrier}
                    onChange={(e) => setFormData({ ...formData, carrier: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300"
                    data-testid="member-carrier-checkbox"
                  />
                  <span className="text-sm font-medium text-slate-700">Carrier</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.deceased}
                    onChange={(e) => setFormData({ ...formData, deceased: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300"
                    data-testid="member-deceased-checkbox"
                  />
                  <span className="text-sm font-medium text-slate-700">Deceased</span>
                </label>
              </div>
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
      </Dialog>

      {/* Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]" data-testid="interview-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>
              Family History Interview
            </DialogTitle>
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
                      className={`p-3 rounded-xl animate-fade-in ${
                        msg.type === 'bot'
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
      </Dialog>
    </div>
  );
}
