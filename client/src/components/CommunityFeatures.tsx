import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Users, Camera, MessageSquare, Heart, Search, 
  ThumbsUp, MapPin, Clock, Share2, Upload, Filter,
  UserPlus, Bookmark, Tag, Star, AlertTriangle, Flag
} from 'lucide-react';

// User review interface
interface UserReview {
  id: string;
  userName: string;
  userAvatar?: string;
  location: string;
  rating: number;
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  tags: string[];
  verified: boolean;
  userInitials: string;
}

// Photo post interface
interface PhotoPost {
  id: string;
  userName: string;
  userAvatar?: string;
  userInitials: string;
  imageUrl: string;
  caption: string;
  location: string;
  timestamp: string;
  likes: number;
  tags: string[];
  coordinates?: { lat: number; lng: number };
}

// Forum post interface
interface ForumPost {
  id: string;
  userName: string;
  userAvatar?: string;
  userInitials: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  likes: number;
  comments: number;
  category: string;
}

// Volunteer opportunity interface
interface VolunteerOpportunity {
  id: string;
  title: string;
  organization: string;
  logoUrl?: string;
  location: string;
  date: string;
  timeCommitment: string;
  requiredSkills: string[];
  description: string;
  contactPerson: string;
  contactEmail: string;
  spotsAvailable: number;
  coordinates?: { lat: number; lng: number };
}

// Mock data for user reviews - in a real app, this would come from an API
const USER_REVIEWS: UserReview[] = [
  {
    id: "R1",
    userName: "Amit Sharma",
    userInitials: "AS",
    location: "Ramkund",
    rating: 5,
    content: "Had a wonderful spiritual experience at Ramkund. The authorities have maintained the place well and there's good crowd management. Highly recommend visiting during the early morning for the best experience.",
    images: ["/images/review1.jpg"],
    timestamp: "2025-03-20T14:30:00",
    likes: 42,
    tags: ["Spiritual", "Clean", "Well Managed"],
    verified: true
  },
  {
    id: "R2",
    userName: "Priya Patel",
    userInitials: "PP",
    location: "Kalaram Temple",
    rating: 4,
    content: "Kalaram Temple is a must-visit during Kumbh Mela. The architecture is amazing and the spiritual energy is palpable. Only giving 4 stars because it was very crowded and slightly difficult to navigate.",
    timestamp: "2025-03-19T10:15:00",
    likes: 38,
    tags: ["Beautiful", "Crowded", "Spiritual"],
    verified: true
  },
  {
    id: "R3",
    userName: "Rahul Mehta",
    userInitials: "RM",
    location: "Tapovan",
    rating: 5,
    content: "Tapovan offers a serene atmosphere even during the busy Kumbh period. The natural beauty combined with the spiritual significance makes it worthwhile. Volunteers were helpful in providing guidance.",
    images: ["/images/review3.jpg"],
    timestamp: "2025-03-18T16:45:00",
    likes: 27,
    tags: ["Peaceful", "Helpful Staff", "Beautiful"],
    verified: false
  },
  {
    id: "R4",
    userName: "Meera Desai",
    userInitials: "MD",
    userAvatar: "/avatars/meera.jpg",
    location: "Godavari Ghat",
    rating: 3,
    content: "The ghat itself is beautiful and has historical significance, but I found the infrastructure inadequate for the Kumbh crowds. More toilets and changing rooms would greatly improve the experience.",
    timestamp: "2025-03-21T09:20:00",
    likes: 15,
    tags: ["Historical", "Crowded", "Needs Improvement"],
    verified: true
  }
];

// Mock data for photo posts - in a real app, this would come from an API
const PHOTO_POSTS: PhotoPost[] = [
  {
    id: "P1",
    userName: "Vikram Singh",
    userInitials: "VS",
    imageUrl: "/images/kumbh1.jpg",
    caption: "Sunrise at Ramkund. The golden light touching the sacred waters was a transcendent moment. #KumbhMela2025 #Spirituality",
    location: "Ramkund",
    timestamp: "2025-03-21T06:30:00",
    likes: 78,
    tags: ["Sunrise", "Spiritual", "Beautiful"],
    coordinates: { lat: 20.0058, lng: 73.7912 }
  },
  {
    id: "P2",
    userName: "Ananya Joshi",
    userInitials: "AJ",
    userAvatar: "/avatars/ananya.jpg",
    imageUrl: "/images/kumbh2.jpg",
    caption: "The magnificent procession of sadhus making their way to the holy dip. A once-in-a-lifetime sight! #KumbhMela #Tradition",
    location: "Panchavati",
    timestamp: "2025-03-20T11:15:00",
    likes: 124,
    tags: ["Traditional", "Sadhus", "Procession"],
    coordinates: { lat: 20.0065, lng: 73.7905 }
  },
  {
    id: "P3",
    userName: "Ravi Kumar",
    userInitials: "RK",
    imageUrl: "/images/kumbh3.jpg",
    caption: "Evening aarti at Godavari Ghat. The blend of light, sound, and devotion creates an atmosphere unlike any other. #Devotion #KumbhMela",
    location: "Godavari Ghat",
    timestamp: "2025-03-19T19:45:00",
    likes: 96,
    tags: ["Evening", "Aarti", "Devotional"],
    coordinates: { lat: 19.9975, lng: 73.7765 }
  }
];

// Mock data for forum posts - in a real app, this would come from an API
const FORUM_POSTS: ForumPost[] = [
  {
    id: "F1",
    userName: "Suresh Kulkarni",
    userInitials: "SK",
    title: "Tips for first-time Kumbh visitors with children",
    content: "I'm visiting Kumbh Mela with my 8 and 10-year-old children. Any advice on managing kids in the crowds? What are the must-visit spots that are child-friendly? Also looking for recommendations on family accommodation near Ramkund.",
    tags: ["First Timer", "Family", "Advice Needed"],
    timestamp: "2025-03-21T08:30:00",
    likes: 23,
    comments: 17,
    category: "Questions"
  },
  {
    id: "F2",
    userName: "Neha Sharma",
    userInitials: "NS",
    userAvatar: "/avatars/neha.jpg",
    title: "My transformative experience at Trimbakeshwar",
    content: "I wanted to share my profound spiritual experience at Trimbakeshwar during the Kumbh. The vibrations around the temple were incredibly powerful. I spent three hours in meditation and felt a deep connection I've never experienced before. Has anyone else had similar experiences?",
    tags: ["Spiritual Experience", "Meditation", "Trimbakeshwar"],
    timestamp: "2025-03-20T16:15:00",
    likes: 56,
    comments: 32,
    category: "Experiences"
  },
  {
    id: "F3",
    userName: "Anil Kapoor",
    userInitials: "AK",
    title: "Best time to visit Ramkund to avoid extreme crowds",
    content: "I'm planning my Kumbh visit for next week. Can anyone suggest the best time of day to visit Ramkund to avoid the most intense crowds but still experience the spiritual atmosphere? I'm particularly interested in witnessing the rituals.",
    tags: ["Planning", "Crowd Management", "Ramkund"],
    timestamp: "2025-03-19T12:45:00",
    likes: 19,
    comments: 24,
    category: "Questions"
  }
];

// Mock data for volunteer opportunities - in a real app, this would come from an API
const VOLUNTEER_OPPORTUNITIES: VolunteerOpportunity[] = [
  {
    id: "V1",
    title: "Crowd Management Volunteers",
    organization: "Kumbh Mela Committee",
    logoUrl: "/logos/kumbh-committee.png",
    location: "Multiple Locations",
    date: "March 22-25, 2025",
    timeCommitment: "4-hour shifts",
    requiredSkills: ["Good Communication", "Physical Stamina", "Basic English/Hindi"],
    description: "Join our team helping manage pilgrim flow at key locations. Volunteers will assist in guiding visitors, helping with queue management, and providing directions. Training will be provided.",
    contactPerson: "Rajesh Singh",
    contactEmail: "volunteers@kumbhcommittee.org",
    spotsAvailable: 25,
    coordinates: { lat: 20.0059, lng: 73.7913 }
  },
  {
    id: "V2",
    title: "Lost & Found Assistance",
    organization: "Nashik Police Department",
    logoUrl: "/logos/nashik-police.png",
    location: "Central Kumbh Help Center",
    date: "March 20-28, 2025",
    timeCommitment: "6-hour shifts",
    requiredSkills: ["Empathy", "Organization", "Trilingual (Marathi/Hindi/English)"],
    description: "Help reunite lost individuals with their families and handle lost items at our central help center. This is a critical service during the Kumbh Mela that requires patience and organizational skills.",
    contactPerson: "Inspector Deshmukh",
    contactEmail: "lostandfound@nashikpolice.gov.in",
    spotsAvailable: 10,
    coordinates: { lat: 20.0064, lng: 73.7904 }
  },
  {
    id: "V3",
    title: "Food Distribution Volunteers",
    organization: "Seva Foundation",
    logoUrl: "/logos/seva-foundation.png",
    location: "Tapovan",
    date: "March 23-27, 2025",
    timeCommitment: "3-hour shifts",
    requiredSkills: ["Food Handling Experience", "Physical Stamina"],
    description: "Join our team distributing free meals to pilgrims and sadhus. Tasks include food preparation, serving, and cleanup. This is a rewarding opportunity to provide essential services to Kumbh participants.",
    contactPerson: "Sunita Patil",
    contactEmail: "volunteer@sevafoundation.org",
    spotsAvailable: 15,
    coordinates: { lat: 20.0116, lng: 73.7938 }
  }
];

export function CommunityFeatures() {
  const [activeTab, setActiveTab] = useState("reviews");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewFilter, setReviewFilter] = useState<string>("all");
  const [photoFilter, setPhotoFilter] = useState<string>("all");
  const [forumFilter, setForumFilter] = useState<string>("all");
  const [volunteerFilter, setVolunteerFilter] = useState<string>("all");
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showForumDialog, setShowForumDialog] = useState(false);
  
  // Filter user reviews based on search and filters
  const filteredReviews = USER_REVIEWS.filter(review => {
    // Search filter
    const matchesSearch = 
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Rating filter
    const matchesRating = 
      reviewFilter === "all" || 
      (reviewFilter === "5star" && review.rating === 5) ||
      (reviewFilter === "4star" && review.rating === 4) ||
      (reviewFilter === "3star" && review.rating <= 3);
    
    return matchesSearch && matchesRating;
  });
  
  // Filter photo posts based on search and filters
  const filteredPhotos = PHOTO_POSTS.filter(photo => {
    // Search filter
    const matchesSearch = 
      photo.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Location filter
    const matchesLocation = 
      photoFilter === "all" || 
      photo.location.toLowerCase() === photoFilter.toLowerCase();
    
    return matchesSearch && matchesLocation;
  });
  
  // Filter forum posts based on search and filters
  const filteredForumPosts = FORUM_POSTS.filter(post => {
    // Search filter
    const matchesSearch = 
      post.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = 
      forumFilter === "all" || 
      post.category.toLowerCase() === forumFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });
  
  // Filter volunteer opportunities based on search and filters
  const filteredVolunteerOpportunities = VOLUNTEER_OPPORTUNITIES.filter(opportunity => {
    // Search filter
    const matchesSearch = 
      opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.requiredSkills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Time commitment filter
    const matchesTimeCommitment = 
      volunteerFilter === "all" || 
      (volunteerFilter === "short" && opportunity.timeCommitment.includes("3-hour")) ||
      (volunteerFilter === "medium" && opportunity.timeCommitment.includes("4-hour")) ||
      (volunteerFilter === "long" && opportunity.timeCommitment.includes("6-hour"));
    
    return matchesSearch && matchesTimeCommitment;
  });
  
  // Star rating component
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-600" />
          Community Features
        </CardTitle>
        <CardDescription>
          Share experiences, browse photos, join discussions, and find volunteer opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="reviews">
              <ThumbsUp className="h-4 w-4 mr-2 hidden sm:inline" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="photos">
              <Camera className="h-4 w-4 mr-2 hidden sm:inline" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="forum">
              <MessageSquare className="h-4 w-4 mr-2 hidden sm:inline" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="volunteer">
              <Users className="h-4 w-4 mr-2 hidden sm:inline" />
              Volunteer
            </TabsTrigger>
          </TabsList>
          
          {/* Search and filter bar */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search..." 
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {activeTab === "reviews" && (
              <Select 
                value={reviewFilter} 
                onValueChange={setReviewFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="5star">5 stars only</SelectItem>
                  <SelectItem value="4star">4 stars only</SelectItem>
                  <SelectItem value="3star">3 stars or less</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {activeTab === "photos" && (
              <Select 
                value={photoFilter} 
                onValueChange={setPhotoFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  <SelectItem value="Ramkund">Ramkund</SelectItem>
                  <SelectItem value="Panchavati">Panchavati</SelectItem>
                  <SelectItem value="Tapovan">Tapovan</SelectItem>
                  <SelectItem value="Godavari Ghat">Godavari Ghat</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {activeTab === "forum" && (
              <Select 
                value={forumFilter} 
                onValueChange={setForumFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="questions">Questions</SelectItem>
                  <SelectItem value="experiences">Experiences</SelectItem>
                  <SelectItem value="tips">Tips & Advice</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {activeTab === "volunteer" && (
              <Select 
                value={volunteerFilter} 
                onValueChange={setVolunteerFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time commitment</SelectItem>
                  <SelectItem value="short">Short (3 hours)</SelectItem>
                  <SelectItem value="medium">Medium (4 hours)</SelectItem>
                  <SelectItem value="long">Long (6+ hours)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Create/Share buttons based on active tab */}
          <div className="mb-4 flex justify-end">
            {activeTab === "reviews" && (
              <Button variant="outline" className="gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>Write Review</span>
              </Button>
            )}
            
            {activeTab === "photos" && (
              <Button 
                variant="outline" 
                className="gap-1"
                onClick={() => setShowPhotoDialog(true)}
              >
                <Camera className="h-4 w-4" />
                <span>Share Photo</span>
              </Button>
            )}
            
            {activeTab === "forum" && (
              <Button 
                variant="outline" 
                className="gap-1"
                onClick={() => setShowForumDialog(true)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>New Post</span>
              </Button>
            )}
          </div>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map(review => (
                <div 
                  key={review.id} 
                  className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      {review.userAvatar && <AvatarImage src={review.userAvatar} alt={review.userName} />}
                      <AvatarFallback className="bg-purple-100 text-purple-700">{review.userInitials}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{review.userName}</h3>
                        {review.verified && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs px-1 py-0">
                            Verified
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{review.location}</span>
                        </div>
                      </div>
                      
                      <div className="mt-1 mb-2">
                        <StarRating rating={review.rating} />
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{review.content}</p>
                      
                      {review.images && review.images.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {review.images.map((image, index) => (
                            <div key={index} className="h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                              {/* In a real app, these would be actual images */}
                              <div className="h-full w-full flex items-center justify-center bg-purple-50 text-purple-800">
                                <Camera className="h-8 w-8" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {review.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-purple-50 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(review.timestamp).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex gap-3">
                          <button className="flex items-center gap-1 hover:text-purple-600">
                            <Heart className="h-3.5 w-3.5" />
                            <span>{review.likes}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-purple-600">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Reply</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-purple-600">
                            <Flag className="h-3.5 w-3.5" />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="font-medium">No reviews found</h3>
                <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            {filteredPhotos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPhotos.map(photo => (
                  <div 
                    key={photo.id} 
                    className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Photo */}
                    <div className="h-48 bg-gray-100 relative">
                      {/* In a real app, this would display the actual image */}
                      <div className="h-full w-full flex items-center justify-center bg-purple-50 text-purple-800">
                        <Camera className="h-16 w-16" />
                      </div>
                      
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full bg-white">
                          <Heart className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full bg-white">
                          <Share2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full bg-white">
                          <Bookmark className="h-4 w-4 text-purple-500" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Photo info */}
                    <div className="p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          {photo.userAvatar && <AvatarImage src={photo.userAvatar} alt={photo.userName} />}
                          <AvatarFallback className="bg-purple-100 text-purple-700">{photo.userInitials}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="font-medium text-sm">{photo.userName}</div>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{photo.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{photo.caption}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {photo.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-purple-50 text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                          <span>{photo.likes} likes</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(photo.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="font-medium">No photos found</h3>
                <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          {/* Forum Tab */}
          <TabsContent value="forum" className="space-y-4">
            {filteredForumPosts.length > 0 ? (
              filteredForumPosts.map(post => (
                <div 
                  key={post.id} 
                  className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {post.userAvatar && <AvatarImage src={post.userAvatar} alt={post.userName} />}
                          <AvatarFallback className="bg-purple-100 text-purple-700">{post.userInitials}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="font-medium text-sm">{post.userName}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(post.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="bg-violet-50 text-violet-700">
                        {post.category}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                    
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">{post.content}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </button>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        View Discussion
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="font-medium">No forum posts found</h3>
                <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          {/* Volunteer Tab */}
          <TabsContent value="volunteer" className="space-y-4">
            {filteredVolunteerOpportunities.length > 0 ? (
              filteredVolunteerOpportunities.map(opportunity => (
                <div 
                  key={opportunity.id} 
                  className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800">
                          <Users className="h-6 w-6" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">{opportunity.title}</h3>
                          <div className="text-sm text-gray-600">{opportunity.organization}</div>
                        </div>
                      </div>
                      
                      <Badge className="bg-green-100 text-green-800">
                        {opportunity.spotsAvailable} spots left
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{opportunity.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{opportunity.date} ({opportunity.timeCommitment})</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{opportunity.description}</p>
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">Required Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.requiredSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-purple-50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="text-sm">
                        <div>Contact: {opportunity.contactPerson}</div>
                        <div className="text-purple-600">{opportunity.contactEmail}</div>
                      </div>
                      
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register to Volunteer
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="font-medium">No volunteer opportunities found</h3>
                <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 text-xs text-gray-600 flex justify-between items-center rounded-b-lg">
        <div className="flex items-center">
          <Users className="h-3.5 w-3.5 text-purple-600 mr-1" />
          Join 5,000+ community members
        </div>
        <Button variant="link" className="text-purple-600 p-0 h-auto">
          Community Guidelines
        </Button>
      </CardFooter>
      
      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share a Photo</DialogTitle>
            <DialogDescription>
              Share your Kumbh Mela experience with the community
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max. 5MB)</p>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="caption" className="text-sm font-medium">
                Caption
              </label>
              <Textarea 
                id="caption" 
                placeholder="Write a caption for your photo..."
                className="resize-none"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Select>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ramkund">Ramkund</SelectItem>
                  <SelectItem value="Tapovan">Tapovan</SelectItem>
                  <SelectItem value="Kalaram Temple">Kalaram Temple</SelectItem>
                  <SelectItem value="Panchavati">Panchavati</SelectItem>
                  <SelectItem value="Godavari Ghat">Godavari Ghat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="tags" className="text-sm font-medium flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </label>
              <Input 
                id="tags" 
                placeholder="Add tags separated by commas (e.g., Spiritual, Sunset, Ritual)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhotoDialog(false)}>
              Cancel
            </Button>
            <Button className="gap-1" onClick={() => setShowPhotoDialog(false)}>
              <Camera className="h-4 w-4" />
              Share Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Forum Post Dialog */}
      <Dialog open={showForumDialog} onOpenChange={setShowForumDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a New Post</DialogTitle>
            <DialogDescription>
              Start a discussion or share your experience with the community
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Questions">Questions</SelectItem>
                  <SelectItem value="Experiences">Experiences</SelectItem>
                  <SelectItem value="Tips">Tips & Advice</SelectItem>
                  <SelectItem value="Information">Information</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input 
                id="title" 
                placeholder="Give your post a title"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea 
                id="content" 
                placeholder="Write your post content here..."
                className="min-h-[120px] resize-none"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="forum-tags" className="text-sm font-medium flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </label>
              <Input 
                id="forum-tags" 
                placeholder="Add tags separated by commas"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForumDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowForumDialog(false)}>
              Post to Forum
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}