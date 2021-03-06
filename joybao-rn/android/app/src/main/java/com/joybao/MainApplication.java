package com.joybao;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.beefe.picker.PickerViewPackage;
import io.realm.react.RealmReactPackage;
import com.remobile.toast.RCTToastPackage;
import com.imagepicker.ImagePickerPackage;
import com.pingplusplus.react.PingppPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new PickerViewPackage(),
            new RealmReactPackage(),
            new RCTToastPackage(),
            new ImagePickerPackage(),
            new PingppPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
