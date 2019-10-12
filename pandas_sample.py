#git practice1


"""pandasによる時系列データの処理チュートリアル

このチュートリアルでは、次の処理を順番に行います。
(1) データを取り込む(日付列あり)
(2) 対象列をフラグにする
(3) フラグにしたカラムの移動平均値を算出する。
(4) 結果をファイルに出力する。

このファイルは、次のように実行します。
$ python pandas_sample.py

スクリプト内で、data_sample.csv が読み込まれ、フラグ列と
移動平均列が付与されたデータが result.csv に保存されます。
"""

import numpy as np
import pandas as pd

if __name__ == "__main__":
    # 入力データパス
    # 前処理済みデータを抜粋したものを利用します。
    fpath_in = "./data_sample.csv"
    # 出力データパス
    fpath_out = "./result.csv"

    # pandas は、Excelのようなテーブル形式のデータを取り込むライブラリです。
    # csvファイルからの取り込みは、pd.read_csv で実施します。
    # 但し、日付型は自動認識されるわけではないので、
    # 明示的に日付列を parse_dates に日付列の列名のリストで指定します。
    # ※ 文字コードが sjis の場合には encoding="sjis" とします
    df = pd.read_csv(fpath_in, parse_dates=["timestamp"])

    # 次を実施する場合は、日付列をインデックスに設定します。
    #  - 日付を横軸とするグラフの描画
    #  - 日付を用いたデータ加工処理・集計の実施(移動平均など)
    # inplace : Truenの場合は、結果を上書きします。
    df.set_index("timestamp", inplace=True)

    # CH1の100-200Hz平均振幅の列を1列だけ取得します。
    # 取得した値(ampl)は、1列のデータ pd.Series 型となります。
    # この1列のデータも index に時刻を持ちます。
    ampl = df["CH1_AmplMean_100"]

    # ある値を超えたら 1, それ以外はゼロのフラグを生成します。
    # 色んな方法がありますが、np.where と pd.Series を組み合わせる
    # 方法が良さそうです。
    # np.where では時刻の情報が失われるので、pd.Series で再度
    # 時刻を設定しています。
    threshold = 0.1  # しきい値
    flag = pd.Series(np.where(threshold < ampl, 1, 0), index=ampl.index)

    # 算出したフラグ列の移動平均を算出します。
    # 移動平均は、rolling と mean の合わせ技です
    #  - rolling(<時間幅>) : 指定時間幅の移動ウインドウを設定する
    #      時間幅は "5min"(5分), "10S"(10秒), "500L"(500ms) のように指定
    #  - mean() : rolling() のあとで指定すると、移動平均となる。
    
    #直近時間幅でスレッショルドを超えた割合
    rolling_mean = flag.rolling("60min").mean()

    # 算出したフラグ・移動平均値を元のテーブルに追加してみます
    # insert は、挿入列の位置, 列名, 挿入する1列の値の3つ組で指定します。
    df.insert(df.shape[1], "flag", flag)
    df.insert(df.shape[1], "rolling_mean", rolling_mean)

    # 算出した結果を含むテーブルを csv ファイルに保存します。
    df.to_csv(fpath_out)
