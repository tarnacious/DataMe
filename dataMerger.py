#!/usr/bin/env python
# encoding: utf-8
"""
untitled.py

Created by Andy Giefer on 2013-09-12.
Copyright (c) 2013 __MyCompanyName__. All rights reserved.
"""

import sys
import os
import json
import csv
import datetime
from dateutil import parser

OPENPATH_DATA_FILENAME = "../cosmin/openpaths_coscab.json"
TWITTER_DATA_FILENAME = "../cosmin/tweets.csv"

class DataMerger():

	def findNearestOPDataPoint(self, openPathData, tweetTimeStamp):
		
		index = 0
		for opDataPoint in openPathData:
			opTimeStamp = datetime.datetime.utcfromtimestamp(opDataPoint['t'])		
			
			if opTimeStamp >= tweetTimeStamp:
				break
				
			index += 1

		# is the the previous point nearer in time?
		diff1 = opTimeStamp-tweetTimeStamp
		
		olderOpTimeStampString = openPathData[index-1]['t']
		olderOpTimeStamp = datetime.datetime.utcfromtimestamp(olderOpTimeStampString)	
		diff2 = tweetTimeStamp - olderOpTimeStamp
		
		# find nearest index
		indexOfNearestOpDataPoint = None
		
		if diff1<diff2: # op datapoint of <index> is closer to tweet
			indexOfNearestOpDataPoint = index
		else:
			indexOfNearestOpDataPoint = index-1 # op datapoint of <index-1> is closer to tweet			


		#print "Tweet: %s" % tweetTimeStamp
		#print "Previous OP (index=%d): %s" % (index-1, olderOpTimeStamp)
		#print "Next OP (index=%d): %s" % (index, opTimeStamp)
		#print "Chosen index: %d" % indexOfNearestOpDataPoint
		#print 
		
		return indexOfNearestOpDataPoint

	def timeStampOfTweet(self, tweet):
		timeStampString = tweet['timestamp']
		timeStamp = parser.parse(timeStampString)
		timeStamp = timeStamp.replace(tzinfo=None)
		return timeStamp
		

	def merge(self):
		
		openPathData = self.importOpenPathData(OPENPATH_DATA_FILENAME)
		originalTwitterData = self.importTweets()

		# reverse twitterData
		twitterData = []
		for tweet in originalTwitterData[::-1]:
			twitterData.append(tweet)

		insertPoints = []
		
		indexOfFirstTweet = 0
		for tweet in twitterData:
			
			timeStamp = self.timeStampOfTweet(tweet)
			
			# skip over tweets earlier than OP recording 
			if timeStamp < parser.parse("2012-03-09 20:26:40"):
				indexOfFirstTweet += 1
				continue
			
			index = self.findNearestOPDataPoint(openPathData, timeStamp)
			insertPoints.append(index)


		#print insertPoints
		
		# go through open path data
		opIndex = 0
		tweetIndex = indexOfFirstTweet
		insertIndex = 0

		outputList = []

		for opDataPoint in openPathData:

			outputObject = {}

			opTimeStamp = datetime.datetime.utcfromtimestamp(opDataPoint['t'])
			lon = opDataPoint['lon']
			lat = opDataPoint['lat']
			
			outputObject['timestamp'] = opTimeStamp.strftime('%s')
			outputObject['geoLocation'] = {"lon":lon, "lat":lat}			
			
			#nextTweet = self.getTweetWithIndex(twitterData, tweetIndex)

			# append to output list
			outputList.append(outputObject)
			#print "OP: %d\tTW: %d\tIN: %d" % (opIndex, tweetIndex, insertIndex)

			# insert tweet(s)
			if insertIndex < len(insertPoints):

				nextTweet = twitterData[tweetIndex]
				nextTweetTimeStamp = self.timeStampOfTweet(nextTweet)
				
				if opIndex == insertPoints[insertIndex]:
					while opIndex == insertPoints[insertIndex]:
						twOutputObject = {}
						twOutputObject['timestamp'] = nextTweetTimeStamp.strftime('%s')
						twOutputObject['geoLocation'] = {"lon":lon, "lat":lat}
						twOutputObject['source'] = 'twitter'
						twOutputObject['data'] = {
							"text": nextTweet["text"],
							"expanded_url": nextTweet["expanded_url"],
							"user_name": nextTweet["user_name"],
							"user_handle": nextTweet["user_handle"],
						}
						tweetIndex += 1
						insertIndex += 1
						outputList.append(twOutputObject)
						#print "\tOP: %d\tTW: %d\tIN: %d" % (opIndex, tweetIndex, insertIndex)
					
						if insertIndex == len(insertPoints):
							break 
			

			opIndex += 1
			
		return outputList
				
	def getTweetWithIndex(self, tweets, wantedIndex):

		index = 0
		
		for tweet in tweets:
			print wantedIndex, index
			if index == wantedIndex:
				return tweet
			index += 1

	def importOpenPathData(self, fileName):
		
		fd = open(fileName, 'r')
		fileContent = fd.read()
		contentAsDict = json.loads(fileContent)
		
		# eliminate duplicates
		opDataList = []
		
		previousT = None
		for opDataPoint in contentAsDict:
			newT = opDataPoint["t"]
			
			if newT != previousT:
				opDataList.append(opDataPoint)
			
			previousT = newT
			
		return opDataList
		

	def importTweets(self):
		
		fd = open(TWITTER_DATA_FILENAME, 'r')
		reader = csv.reader(fd, delimiter=',', quotechar='"')
		
		tweets = []
		
		# skip first line
		index = 0
		
		for row in reader:
			
			if index == 0:
				index = 1
				continue
			
			timeStamp = row[3]
			text = row[5]
			expandedUrl = row[9]
			
			userName = "Cosmin"
			userHandle = "@pushthings4ward"
			userImage = "https://si0.twimg.com/profile_images/1282416147/org_pushthings4ward_bigger.png"		

			#print timeStamp
			#print '\t', text
			#print '\t\t', expandedUrl
		
			tweets.append({
				"text": text,
				"user_name": userName,
				"user_handle": userHandle,
				"user_image": userImage,
				"expanded_url": expandedUrl,
				"timestamp": timeStamp
			})
			
		return tweets


	def summarise(self, eventList, segmentDurationInDays):
		
		
		segmentDurationInSeconds = segmentDurationInDays*24*60*60
		event = eventList[0]
		segmentStart = int(event["timestamp"])
		
		segmentList = []
		tweetCounter = 0
		for event in eventList:
			
			timeStamp = int(event["timestamp"])
			
			if event.has_key("source"):
				if event["source"] == "twitter":
					tweetCounter += 1
			
			segmentEnd = segmentStart + segmentDurationInSeconds
			
			if timeStamp >= segmentEnd:
				
				# store segment
				segment = {"start":segmentStart, "end":segmentEnd, "tweet_count":tweetCounter}
				segmentList.append(segment)
				#print "%s %s %s" % (datetime.datetime.utcfromtimestamp(segmentStart), datetime.datetime.utcfromtimestamp(segmentEnd), segment)
				
				# reset
				tweetCounter = 0
				segmentStart += segmentDurationInSeconds
		
		# last segment: replace segmentEnd with timestamp of last event
		#segmentList[-1]["end"] = int(event["timestamp"])
		
		# last segment
		segment = {"start":segmentStart, "end":int(event["timestamp"]), "tweet_count":tweetCounter}
		segmentList.append(segment)
			
		return segmentList

if __name__ == '__main__':
	
	dm = DataMerger()
	#output = dm.merge()
	#print json.dumps(output, indent=2)

	fd = open ("timeline.json", "r")
	dataString = fd.read()
	data = json.loads(dataString)
	summary = dm.summarise(data, 30)
	print json.dumps(summary, indent=2)
