import React from 'react'
import {View} from 'react-native'
import {AppBskyActorDefs, AppBskyFeedDefs, moderateProfile} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {logger} from '#/logger'
import {isWeb} from '#/platform/detection'
import {useModerationOpts} from '#/state/preferences/moderation-opts'
import {useGetPopularFeedsQuery} from '#/state/queries/feed'
import {usePreferencesQuery} from '#/state/queries/preferences'
import {useSuggestedFollowsQuery} from '#/state/queries/suggested-follows'
import {useSession} from '#/state/session'
import {cleanError} from 'lib/strings/errors'
import {ProfileCardWithFollowBtn} from '#/view/com/profile/ProfileCard'
import {List} from '#/view/com/util/List'
import {UserAvatar} from '#/view/com/util/UserAvatar'
import {FeedSourceCard} from 'view/com/feeds/FeedSourceCard'
import {
  FeedFeedLoadingPlaceholder,
  ProfileCardFeedLoadingPlaceholder,
} from 'view/com/util/LoadingPlaceholder'
import {atoms as a, useTheme as useThemeNew} from '#/alf'
import {Button} from '#/components/Button'
import {CircleInfo_Stroke2_Corner0_Rounded as CircleInfo} from '#/components/icons/CircleInfo'
import {Loader} from '#/components/Loader'
import {Text} from '#/components/Typography'

function SuggestedItemsHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const t = useThemeNew()

  return (
    <View
      style={[
        isWeb
          ? [a.flex_row, a.px_lg, a.py_lg, a.gap_md]
          : [{flexDirection: 'row-reverse'}, a.p_lg, a.gap_md],
        {
          borderBottomWidth: 4,
          borderColor: t.palette.primary_500,
        },
      ]}>
      <View style={[a.flex_1, a.gap_xs]}>
        <Text style={[a.flex_1, a.text_2xl, a.font_bold, t.atoms.text]}>
          {title}
        </Text>
        <Text style={[t.atoms.text_contrast_high]}>{description}</Text>
      </View>
    </View>
  )
}

type ExploreScreenItems =
  | {
      type: 'header'
      key: string
      title: string
      description: string
    }
  | {
      type: 'profile'
      key: string
      profile: AppBskyActorDefs.ProfileViewBasic
    }
  | {
      type: 'feed'
      key: string
      feed: AppBskyFeedDefs.GeneratorView
    }
  | {
      type: 'loadMore'
      key: string
      isLoadingMore: boolean
      onLoadMore: () => void
      items: ExploreScreenItems[]
    }
  | {
      type: 'profilePlaceholder'
      key: string
    }
  | {
      type: 'feedPlaceholder'
      key: string
    }
  | {
      type: 'error'
      key: string
      message: string
      error: string
    }

export function Explore() {
  const {_} = useLingui()
  const t = useThemeNew()
  const {hasSession} = useSession()
  const {data: preferences, error: preferencesError} = usePreferencesQuery()
  const moderationOpts = useModerationOpts()
  const {
    data: profiles,
    hasNextPage: hasNextProfilesPage,
    isLoading: isLoadingProfiles,
    isFetchingNextPage: isFetchingNextProfilesPage,
    error: profilesError,
    fetchNextPage: fetchNextProfilesPage,
  } = useSuggestedFollowsQuery({limit: 3})
  const {
    data: feeds,
    hasNextPage: hasNextFeedsPage,
    isLoading: isLoadingFeeds,
    isFetchingNextPage: isFetchingNextFeedsPage,
    error: feedsError,
    fetchNextPage: fetchNextFeedsPage,
  } = useGetPopularFeedsQuery({limit: 3})

  const isLoadingMoreProfiles = isFetchingNextProfilesPage && !isLoadingProfiles
  const onLoadMoreProfiles = React.useCallback(async () => {
    if (isFetchingNextProfilesPage || !hasNextProfilesPage || profilesError)
      return
    try {
      await fetchNextProfilesPage()
    } catch (err) {
      logger.error('Failed to load more suggested follows', {message: err})
    }
  }, [
    isFetchingNextProfilesPage,
    hasNextProfilesPage,
    profilesError,
    fetchNextProfilesPage,
  ])

  const isLoadingMoreFeeds = isFetchingNextFeedsPage && !isLoadingFeeds
  const onLoadMoreFeeds = React.useCallback(async () => {
    if (isFetchingNextFeedsPage || !hasNextFeedsPage || feedsError) return
    try {
      await fetchNextFeedsPage()
    } catch (err) {
      logger.error('Failed to load more suggested follows', {message: err})
    }
  }, [
    isFetchingNextFeedsPage,
    hasNextFeedsPage,
    feedsError,
    fetchNextFeedsPage,
  ])

  const items = React.useMemo<ExploreScreenItems[]>(() => {
    const i: ExploreScreenItems[] = [
      {
        type: 'header',
        key: 'suggested-follows-header',
        title: _(msg`Suggested follows`),
        description: _(msg`Find new friends or interesting accounts`),
      },
    ]

    if (profiles) {
      // Currently the responses contain duplicate items.
      // Needs to be fixed on backend, but let's dedupe to be safe.
      let seen = new Set()
      for (const page of profiles.pages) {
        for (const actor of page.actors) {
          if (!seen.has(actor.did)) {
            seen.add(actor.did)
            i.push({
              type: 'profile',
              key: actor.did,
              profile: actor,
            })
          }
        }
      }

      i.push({
        type: 'loadMore',
        key: 'loadMoreProfiles',
        isLoadingMore: isLoadingMoreProfiles,
        onLoadMore: onLoadMoreProfiles,
        items: i.filter(item => item.type === 'profile').slice(-3),
      })
    } else {
      if (profilesError) {
        i.push({
          type: 'error',
          key: 'profilesError',
          message: _(msg`Failed to load suggested follows`),
          error: cleanError(profilesError),
        })
      } else {
        i.push({type: 'profilePlaceholder', key: 'profilePlaceholder'})
      }
    }

    i.push({
      type: 'header',
      key: 'suggested-feeds-header',
      title: _(msg`Suggested feeds`),
      description: _(msg`Discover new content`),
    })

    if (feeds && preferences) {
      // Currently the responses contain duplicate items.
      // Needs to be fixed on backend, but let's dedupe to be safe.
      let seen = new Set()
      for (const page of feeds.pages) {
        for (const feed of page.feeds) {
          if (!seen.has(feed.uri)) {
            seen.add(feed.uri)
            i.push({
              type: 'feed',
              key: feed.uri,
              feed,
            })
          }
        }
      }

      if (feedsError) {
        i.push({
          type: 'error',
          key: 'feedsError',
          message: _(msg`Failed to load suggested feeds`),
          error: cleanError(feedsError),
        })
      } else if (preferencesError) {
        i.push({
          type: 'error',
          key: 'preferencesError',
          message: _(msg`Failed to load feeds preferences`),
          error: cleanError(preferencesError),
        })
      } else {
        i.push({
          type: 'loadMore',
          key: 'loadMoreFeeds',
          isLoadingMore: isLoadingMoreFeeds,
          onLoadMore: onLoadMoreFeeds,
          items: i.filter(item => item.type === 'feed').slice(-3),
        })
      }
    } else {
      if (feedsError) {
        i.push({
          type: 'error',
          key: 'feedsError',
          message: _(msg`Failed to load suggested feeds`),
          error: cleanError(feedsError),
        })
      } else if (preferencesError) {
        i.push({
          type: 'error',
          key: 'preferencesError',
          message: _(msg`Failed to load feeds preferences`),
          error: cleanError(preferencesError),
        })
      } else {
        i.push({type: 'feedPlaceholder', key: 'feedPlaceholder'})
      }
    }

    return i
  }, [
    _,
    profiles,
    feeds,
    preferences,
    onLoadMoreFeeds,
    onLoadMoreProfiles,
    isLoadingMoreProfiles,
    isLoadingMoreFeeds,
    profilesError,
    feedsError,
    preferencesError,
  ])

  const renderItem = React.useCallback(
    ({item}: {item: ExploreScreenItems}) => {
      switch (item.type) {
        case 'header': {
          return (
            <SuggestedItemsHeader
              title={item.title}
              description={item.description}
            />
          )
        }
        case 'profile': {
          return <ProfileCardWithFollowBtn profile={item.profile} noBg />
        }
        case 'feed': {
          return (
            <FeedSourceCard
              feedUri={item.feed.uri}
              showSaveBtn={hasSession}
              showDescription
              showLikes
              pinOnSave
            />
          )
        }
        case 'loadMore': {
          return (
            <View style={[a.border_t, a.pb_md, t.atoms.border_contrast_low]}>
              <Button
                label={_(msg`Load more`)}
                onPress={item.onLoadMore}
                style={[a.relative, a.w_full]}>
                {({hovered}) => (
                  <View
                    style={[
                      a.flex_1,
                      a.flex_row,
                      a.align_center,
                      a.px_md,
                      a.py_md,
                      hovered && t.atoms.bg_contrast_25,
                    ]}>
                    <View
                      style={[
                        a.relative,
                        {
                          height: 32,
                          width: 52,
                        },
                      ]}>
                      {item.items.map((_item, i) => {
                        return (
                          <View
                            key={_item.key}
                            style={[
                              a.border,
                              t.atoms.bg_contrast_25,
                              a.absolute,
                              {
                                width: 30,
                                height: 30,
                                left: i * 10,
                                borderColor: t.atoms.bg.backgroundColor,
                                borderRadius:
                                  _item.type === 'profile' ? 999 : 4,
                              },
                            ]}>
                            {moderationOpts && (
                              <>
                                {_item.type === 'profile' ? (
                                  <UserAvatar
                                    size={28}
                                    avatar={_item.profile.avatar}
                                    moderation={moderateProfile(
                                      _item.profile,
                                      moderationOpts!,
                                    ).ui('avatar')}
                                  />
                                ) : _item.type === 'feed' ? (
                                  <UserAvatar
                                    size={28}
                                    avatar={_item.feed.avatar}
                                    type="algo"
                                  />
                                ) : null}
                              </>
                            )}
                          </View>
                        )
                      })}
                    </View>

                    <Text
                      style={[
                        a.pl_sm,
                        a.leading_snug,
                        hovered ? t.atoms.text : t.atoms.text_contrast_medium,
                      ]}>
                      <Trans>Load more suggestions</Trans>
                    </Text>

                    <View style={[a.flex_1, a.align_end]}>
                      {item.isLoadingMore && <Loader size="lg" />}
                    </View>
                  </View>
                )}
              </Button>
            </View>
          )
        }
        case 'profilePlaceholder': {
          return <ProfileCardFeedLoadingPlaceholder />
        }
        case 'feedPlaceholder': {
          return <FeedFeedLoadingPlaceholder />
        }
        case 'error': {
          return (
            <View
              style={[
                a.border_t,
                a.pt_md,
                a.px_md,
                t.atoms.border_contrast_low,
              ]}>
              <View
                style={[
                  a.flex_row,
                  a.gap_md,
                  a.p_lg,
                  a.rounded_sm,
                  t.atoms.bg_contrast_25,
                ]}>
                <CircleInfo size="md" fill={t.palette.negative_400} />
                <View style={[a.flex_1, a.gap_sm]}>
                  <Text style={[a.font_bold, a.leading_snug]}>
                    {item.message}
                  </Text>
                  <Text
                    style={[
                      a.italic,
                      a.leading_snug,
                      t.atoms.text_contrast_medium,
                    ]}>
                    {item.error}
                  </Text>
                </View>
              </View>
            </View>
          )
        }
      }
    },
    [_, t, hasSession, moderationOpts],
  )

  return (
    <List
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.key}
      // @ts-ignore web only -prf
      desktopFixedHeight
      contentContainerStyle={{paddingBottom: 200}}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  )
}