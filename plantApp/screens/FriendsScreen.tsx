import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { FriendSearchBar } from '@/components/FriendSearchBar';
import { RequestItem } from '@/components/RequestItem';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { GuildCard } from '@/components/GuildCard';
import type { Friend } from '@/store/useAppStore';

export function FriendsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    user,
    score,
    friends,
    friendRequestsIncoming,
    friendRequestsOutgoing,
    myGuild,
    discoverGuilds,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    createGuild,
    joinGuild,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'friends' | 'guild'>('friends');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildEmblem, setGuildEmblem] = useState(BrandColors.amethyst);

  const handleSendRequest = (username: string) => {
    sendFriendRequest(username);
    Alert.alert('Request Sent', `Friend request sent to ${username}`);
  };

  const handleAccept = (requestId: string) => {
    acceptFriendRequest(requestId);
    Alert.alert('Friend Added', 'You are now friends!');
  };

  const handleDecline = (requestId: string) => {
    declineFriendRequest(requestId);
  };

  const handleInviteFriend = () => {
    Alert.alert('Invite Friend', 'Share feature coming soon! (stub)');
  };

  const handleCreateGuild = () => {
    if (!guildName.trim()) {
      Alert.alert('Name Required', 'Please enter a guild name.');
      return;
    }
    createGuild(guildName.trim(), guildEmblem);
    setShowCreateGuild(false);
    setGuildName('');
    Alert.alert('Guild Created', `Welcome to ${guildName}!`);
  };

  const handleJoinGuild = (guild: any) => {
    joinGuild(guild);
    Alert.alert('Joined Guild', `You've joined ${guild.name}!`);
  };

  const friendsLeaderboard = [
    { id: user?.id || 'me', name: user?.name || 'You', score, avatarUri: user?.avatarUri || null },
    ...friends.map(f => ({ id: f.id, name: f.name, score: f.score, avatarUri: f.avatarUri })),
  ].sort((a, b) => b.score - a.score);

  const guildLeaderboard = myGuild?.members
    ? [...myGuild.members].sort((a, b) => b.score - a.score)
    : [];

  const renderFriendsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <FriendSearchBar onSend={handleSendRequest} />
      </View>

      {friendRequestsIncoming.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Incoming Requests
          </Text>
          {friendRequestsIncoming.map((req) => (
            <RequestItem
              key={req.id}
              username={req.username}
              type="incoming"
              onAccept={() => handleAccept(req.id)}
              onDecline={() => handleDecline(req.id)}
            />
          ))}
        </View>
      )}

      {friendRequestsOutgoing.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Outgoing Requests
          </Text>
          {friendRequestsOutgoing.map((req) => (
            <RequestItem key={req.id} username={req.username} type="outgoing" />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Friends Leaderboard
        </Text>
        {friendsLeaderboard.map((friend, index) => (
          <LeaderboardRow
            key={friend.id}
            rank={index + 1}
            name={friend.name}
            score={friend.score}
            avatarUri={friend.avatarUri}
            onPress={
              friend.id !== user?.id && friend.id !== 'me'
                ? () => {
                    const fullFriend = friends.find(f => f.id === friend.id);
                    if (fullFriend) setSelectedFriend(fullFriend);
                  }
                : undefined
            }
          />
        ))}
      </View>
    </View>
  );

  const renderGuildTab = () => (
    <View style={styles.tabContent}>
      {myGuild ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Your Guild
          </Text>
          <GuildCard guild={myGuild} onPress={() => {}} />

          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }, { marginTop: 24 }]}>
            Guild Leaderboard
          </Text>
          {guildLeaderboard.map((member, index) => (
            <LeaderboardRow
              key={member.id}
              rank={index + 1}
              name={member.name}
              score={member.score}
              avatarUri={member.avatarUri}
            />
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            No Guild Yet
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            Create or join a guild to compete with friends!
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: BrandColors.amethyst }]}
            onPress={() => setShowCreateGuild(true)}
            activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Create Guild</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }, { marginTop: 32 }]}>
            Discover Guilds
          </Text>
          {discoverGuilds.map((guild) => (
            <GuildCard key={guild.id} guild={guild} onPress={() => handleJoinGuild(guild)} />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
      edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Friends & Guilds
        </Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'friends' && styles.activeTab,
            { borderBottomColor: activeTab === 'friends' ? BrandColors.mint : 'transparent' },
          ]}
          onPress={() => setActiveTab('friends')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'friends' ? (isDark ? BrandColors.mint : BrandColors.emerald) : isDark ? '#9BA1A6' : '#687076' },
            ]}>
            Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'guild' && styles.activeTab,
            { borderBottomColor: activeTab === 'guild' ? BrandColors.mint : 'transparent' },
          ]}
          onPress={() => setActiveTab('guild')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'guild' ? (isDark ? BrandColors.mint : BrandColors.emerald) : isDark ? '#9BA1A6' : '#687076' },
            ]}>
            Guild
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'friends' ? renderFriendsTab() : renderGuildTab()}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: BrandColors.amethyst }]}
        onPress={handleInviteFriend}
        activeOpacity={0.8}>
        <Ionicons name="share-social" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal
        visible={selectedFriend !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedFriend(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
            <View style={[styles.modalAvatar, { backgroundColor: BrandColors.amethyst }]}>
              <Text style={styles.modalAvatarText}>{selectedFriend?.name.charAt(0)}</Text>
            </View>

            <Text style={[styles.modalName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {selectedFriend?.name}
            </Text>

            <View style={[styles.scoreBubble, { backgroundColor: BrandColors.emerald }]}>
              <Text style={styles.scoreBubbleText}>{selectedFriend?.score.toLocaleString()}</Text>
            </View>

            <Text style={[styles.modalSectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Garden
            </Text>
            {selectedFriend?.plants && selectedFriend.plants.length > 0 ? (
              <View style={styles.plantGrid}>
                {selectedFriend.plants.map((plant) => (
                  <View
                    key={plant.id}
                    style={[styles.plantGridItem, { backgroundColor: isDark ? '#1E2528' : '#F0F0F0' }]}>
                    <Text style={[styles.plantGridName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                      {plant.name}
                    </Text>
                    <Text style={[styles.plantGridSpecies, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                      {plant.species}
                    </Text>
                    <Text style={[styles.plantGridBrew, { color: BrandColors.mint }]}>
                      {plant.brew}%
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                No plants yet
              </Text>
            )}

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: BrandColors.amethyst }]}
              onPress={() => setSelectedFriend(null)}
              activeOpacity={0.8}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCreateGuild}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateGuild(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
            <Text style={[styles.modalTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Create Guild
            </Text>

            <View style={styles.colorPicker}>
              {[BrandColors.amethyst, BrandColors.emerald, BrandColors.mint, '#FF5252', '#FFC107'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    guildEmblem === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setGuildEmblem(color)}
                  activeOpacity={0.7}
                />
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>
              Guild Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E2528' : '#F0F0F0',
                  color: isDark ? Colors.dark.text : Colors.light.text,
                },
              ]}
              placeholder="Enter guild name"
              placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
              value={guildName}
              onChangeText={setGuildName}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#9BA1A6' }]}
                onPress={() => setShowCreateGuild(false)}
                activeOpacity={0.7}>
                <Text style={[styles.modalButtonText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: BrandColors.amethyst }]}
                onPress={handleCreateGuild}
                activeOpacity={0.8}>
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2528',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalAvatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
  },
  modalName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  scoreBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 24,
  },
  scoreBubbleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  plantGrid: {
    gap: 12,
    marginBottom: 24,
  },
  plantGridItem: {
    padding: 16,
    borderRadius: 12,
  },
  plantGridName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  plantGridSpecies: {
    fontSize: 14,
    marginBottom: 4,
  },
  plantGridBrew: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  colorOptionSelected: {
    borderWidth: 4,
    borderColor: '#FFF',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
