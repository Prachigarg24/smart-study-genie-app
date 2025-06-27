
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Upload,
  Trophy,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  profilePicture: string;
  createdAt: string;
  stats: {
    quizzesTaken: number;
    topicsCompleted: number;
    flashcardsLearned: number;
    studyStreak: number;
  };
}

const UserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    profilePicture: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Load user data from localStorage (in real app, this would be from API)
    const userData = localStorage.getItem('studygenie_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      const fullUserProfile: UserProfile = {
        id: parsedUser.id || '1',
        name: parsedUser.name || 'John Developer',
        email: parsedUser.email || 'john@example.com',
        bio: parsedUser.bio || 'Passionate full-stack developer learning new technologies every day. Love coding in JavaScript, Python, and React!',
        profilePicture: parsedUser.profilePicture || '',
        createdAt: parsedUser.createdAt || new Date().toISOString(),
        stats: {
          quizzesTaken: 23,
          topicsCompleted: 12,
          flashcardsLearned: 156,
          studyStreak: 7
        }
      };
      setUser(fullUserProfile);
      setEditForm({
        name: fullUserProfile.name,
        bio: fullUserProfile.bio,
        profilePicture: fullUserProfile.profilePicture
      });
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      name: editForm.name,
      bio: editForm.bio,
      profilePicture: previewUrl || editForm.profilePicture
    };

    // Update localStorage (in real app, this would be API call)
    localStorage.setItem('studygenie_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    setSelectedImage(null);
    setPreviewUrl('');

    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated!",
    });
  };

  const handleCancel = () => {
    if (!user) return;
    
    setEditForm({
      name: user.name,
      bio: user.bio,
      profilePicture: user.profilePicture
    });
    setIsEditing(false);
    setSelectedImage(null);
    setPreviewUrl('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Loading Profile...</h3>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and view your progress</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal information and bio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={previewUrl || user.profilePicture} 
                    alt={user.name} 
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <div>
                    <Label htmlFor="profile-image" className="cursor-pointer">
                      <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Change Photo</span>
                      </div>
                    </Label>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-lg font-medium">{user.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <Badge variant="secondary">Verified</Badge>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
                )}
              </div>

              {/* Join Date */}
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Stats</CardTitle>
              <CardDescription>Your programming journey progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-semibold">Quizzes Taken</p>
                    <p className="text-2xl font-bold text-blue-600">{user.stats.quizzesTaken}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-semibold">Topics Completed</p>
                    <p className="text-2xl font-bold text-green-600">{user.stats.topicsCompleted}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="font-semibold">Flashcards Learned</p>
                    <p className="text-2xl font-bold text-purple-600">{user.stats.flashcardsLearned}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Zap className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="font-semibold">Study Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{user.stats.studyStreak} days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your coding milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-medium">First Quiz Master</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed your first quiz</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Brain className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium">Flashcard Enthusiast</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learned 100+ flashcards</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Zap className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium">Consistent Learner</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">7-day study streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
