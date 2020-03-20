git checkout -b develop
git push
git checkout -b feature/hoge
git add .
git commit -am "add feature/hoge"
git push
hub pull-request -b develop
