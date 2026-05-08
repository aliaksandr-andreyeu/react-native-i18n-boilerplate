package com.amega.capital.app

import io.branch.rnbranch.*

import android.os.Bundle;
import org.devio.rn.splashscreen.SplashScreen

import android.content.Intent;
import android.content.res.Configuration;

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "amegaCapital"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    val intent = Intent("onConfigurationChanged")
    intent.putExtra("newConfig", newConfig)
    sendBroadcast(intent)
  }

  override fun onStart() {
    super.onStart()
    RNBranchModule.initSession(getIntent().getData(), this)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    RNBranchModule.onNewIntent(intent)
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreen.show(this, R.id.lottie); 
    super.onCreate(null)
  }
}
