# 存储文件的函数
import os


def save_img(path, file):
    base = "/media"
    # path = "avator"
    path = path
    file_path = os.path.join(base,path, file.name)
    print("file_path",file_path)
    # 写入文件
    with open(file_path,"wb") as f:
        for chunk in file.chunks():
            f.write(chunk)
    return file_path

if __name__ == '__main__':
    # print(save_img("avator", "xxxx.jpg"))
    pass