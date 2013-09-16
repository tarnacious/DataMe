#!/usr/bin/env python
# encoding: utf-8
"""
untitled.py

Created by Andy Giefer on 2013-09-12.
Copyright (c) 2013 __MyCompanyName__. All rights reserved.
"""

import sys
import os
import tweepy
from pprint import pprint
import datetime

CONSUMER_KEY = 'VFYBvBXgudnEWvBisCV2w'
CONSUMER_SECRET = '6PWo16wop7uB7ZFRF2kGpf0VYeWbN3mKvRQbKvV65t8'
ACCESS_KEY = '370791637-ARnJIqJ6fxDhzZaQxf1koqDYBiU9KF8cFlsrRtiR'
ACCESS_SECRET = 'A0ExayUGI1i0BxyFYjlGx6HG0g7dqYwTihZZQtQ'


class TweetController():
	
	def __init(self):
		self.api = None
	
	def connect(self):
		
		auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
		auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)

		self.api = tweepy.API(auth)
		return self.api
	
	def test(self):
		
		user = self.api.get_user('twitter')
		
		print user.screen_name
		print user.followers_count
		for friend in user.friends():
		   print friend.screen_name
		
	def search(self, q, geocode):
		
		result = self.api.search(q)
		return result
		

	def geoTimeSearch(self, lat, long, radiusInKm, startDatetime, endDatetime):
		
		# untilDate is exclusive -> add one day to endDatetime
		untilDate = endDatetime + datetime.timedelta(1)
		
		geoString = "%.6f,%.6f,%.3fkm" % (lat, long, radiusInKm)
		untilString = untilDate.strftime("%Y-%m-%d")

		tweets = []
		for tweet in tweepy.Cursor(api.search, geocode=geoString, until=untilString).items():

			if tweet.created_at >= startDatetime and tweet.created_at <= endDatetime:
				tweets.append(tweet)
				
		return tweets
		
	def listTweets(self, tweets):

		for tweet in tweets:
			#describeObject(tweet)
			#print '\n'
			print tweet.created_at, tweet.text

	def extractImages(self, tweets):
		
		urlList = []
		for tweet in tweets:
			urls = tweet.entities.urls
			
			for url in urls:
				urlList.append(url.url)
		
		return urlList
			
def describeObject(obj):
	pprint (vars(obj))
	 		
if __name__ == '__main__':
	
	tc = TweetController()
	api = tc.connect()

	# time in UTC
	start = datetime.datetime(2013, 9, 10, 14, 0, 0)
	stop = datetime.datetime(2013, 9, 10, 18, 0, 0)
	
	# get tweets
	tweets = tc.geoTimeSearch(48.398376,9.991111, 1, start, stop) 
	
	# list tweets
	tc.listTweets(tweets)
		
	# list images
	#urlList = tc.extractImages(tweets)
	#print urlList