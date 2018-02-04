/*
 * This file is part of the clavem.js npm package. Copyright (C) 2016 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

const DropboxPlatform = require("./platforms/dropbox");
const FacebookPlatform = require("./platforms/facebook");
const GooglePlatform = require("./platforms/google");
const GithubPlatform = require("./platforms/github");
const InstagramPlatform = require("./platforms/instagram");
const LinkedInPlatform = require("./platforms/linked_in");
const LivePlatform = require("./platforms/live");
const PinterestPlatform = require("./platforms/pinterest");
const TumblrPlatform = require("./platforms/tumblr");
const TwitterPlatform = require("./platforms/twitter");

/**
 * The list of supported platforms, recognized by the clavem:// URL handler.
 *
 * @type {{dropbox: DropboxPlatform, facebook: FacebookPlatform, github: GithubPlatform, google: GooglePlatform, instagram: InstagramPlatform, linkedin: LinkedInPlatform, live: LivePlatform, pinterest: PinterestPlatform, tumblr: TumblrPlatform, twitter: TwitterPlatform}}
 * @module clavem.platforms
 * @namespace clavem.platforms
 */
module.exports = {
  dropbox: DropboxPlatform,
  facebook: FacebookPlatform,
  github: GithubPlatform,
  google: GooglePlatform,
  instagram: InstagramPlatform,
  linkedin: LinkedInPlatform,
  live: LivePlatform,
  pinterest: PinterestPlatform,
  tumblr: TumblrPlatform,
  twitter: TwitterPlatform
};
