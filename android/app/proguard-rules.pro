# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

-dontwarn com.crashlytics.android.answers.shim.**
-dontwarn com.google.firebase.appindexing.**

-keep class com.amega.capital.app.BuildConfig { *; }

-keep class com.appsflyer.** { *; }
-keep class kotlin.jvm.internal.** { *; }

-keep class io.branch.** { *; }
-keep public class com.android.installreferrer.** { *; }

-keep class com.google.android.gms.** { *; }

-keep class com.google.android.play.core.review.** { *; }
-keep class com.google.android.play.core.tasks.** { *; }
-keep class com.google.android.play.core.common.PlayCoreDialogWrapperActivity
